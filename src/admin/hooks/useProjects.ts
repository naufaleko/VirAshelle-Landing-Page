import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project, ProjectStatus } from '../types';
import { withStatusSideEffects } from '../lib/projectStatus';

export function useProjects(filters?: { status?: ProjectStatus; category?: string; search?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);
        let query = supabase.from('projects').select('*');
        
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
        
        query = query.order('deadline', { ascending: true });
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (isMounted && data) {
          setProjects(data as Project[]);
        }
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        if (isMounted) setError(err?.message || 'Gagal memuat daftar proyek');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [filters?.status, filters?.category, filters?.search]);

  const createProject = async (project: Partial<Project>) => {
    const payload = withStatusSideEffects({ progress: 0, ...project }, null);
    const { data, error } = await supabase.from('projects').insert([payload]).select().single();
    if (error) throw error;
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const current = projects.find((p) => p.id === id) ?? null;
    const payload = withStatusSideEffects(updates, current);
    const { data, error } = await supabase.from('projects').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  };

  return { projects, loading, error, createProject, updateProject, deleteProject };
}
