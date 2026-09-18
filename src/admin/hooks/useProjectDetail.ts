import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project, ProjectUpdate } from '../types';

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const [projectRes, updatesRes] = await Promise.all([
          supabase.from('projects').select('*').eq('id', projectId).single(),
          supabase.from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
        ]);

        if (projectRes.error) throw projectRes.error;
        if (updatesRes.error) throw updatesRes.error;

        if (isMounted) {
          setProject(projectRes.data as Project);
          setUpdates(updatesRes.data as ProjectUpdate[]);
        }
      } catch (error) {
        console.error('Error fetching project detail:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    const channel = supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, (payload) => {
        setProject(payload.new as Project);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates', filter: `project_id=eq.${projectId}` }, () => {
        // Simple refetch for updates to ensure ordering
        supabase.from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
          .then(({ data }) => setUpdates((data as ProjectUpdate[]) || []));
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const updateProject = async (updates: Partial<Project>) => {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', projectId).select().single();
    if (error) throw error;
    return data;
  };

  const addUpdate = async (update: Partial<ProjectUpdate>, projectUpdates?: Partial<Project>) => {
    try {
      const { data, error } = await supabase.from('project_updates').insert([{ ...update, project_id: projectId }]).select().single();
      if (error) throw error;
      
      if (projectUpdates && Object.keys(projectUpdates).length > 0) {
        await updateProject(projectUpdates);
      }
      
      return data;
    } catch (err) {
      console.error('Error adding update:', err);
      throw err;
    }
  };

  const deleteProject = async () => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
  };

  return { project, updates, loading, updateProject, addUpdate, deleteProject };
}
