import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project, ProjectStatus } from '../types';

export function useProjects(filters?: { status?: ProjectStatus; category?: string; search?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchProjects() {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error('Error fetching projects:', error);
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
    const { data, error } = await supabase.from('projects').insert([project]).select().single();
    if (error) throw error;
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  };

  return { projects, loading, createProject, updateProject, deleteProject };
}
