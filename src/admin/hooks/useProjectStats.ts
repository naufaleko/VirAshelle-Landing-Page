import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project, ProjectStatus, ProjectUpdate } from '../types';

export function useProjectStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0,
    byStatus: {} as Record<ProjectStatus, number>,
    byCategory: {} as Record<string, number>,
  });
  const [recentUpdates, setRecentUpdates] = useState<(ProjectUpdate & { project_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchStats() {
      try {
        setLoading(true);
        const { data: projects, error: projectsError } = await supabase.from('projects').select('*');
        if (projectsError) throw projectsError;
        
        const { data: updates, error: updatesError } = await supabase.from('project_updates')
          .select('*, projects(title)')
          .order('created_at', { ascending: false })
          .limit(10);
        if (updatesError) throw updatesError;

        if (isMounted && projects) {
          const projs = projects as Project[];
          const now = new Date();
          
          const newStats = {
            total: projs.length,
            active: projs.filter(p => p.status !== 'completed' && p.status !== 'on_hold').length,
            completed: projs.filter(p => p.status === 'completed').length,
            overdue: projs.filter(p => p.deadline && new Date(p.deadline) < now && p.status !== 'completed').length,
            byStatus: projs.reduce((acc, p) => {
              acc[p.status] = (acc[p.status] || 0) + 1;
              return acc;
            }, {} as Record<ProjectStatus, number>),
            byCategory: projs.reduce((acc, p) => {
              acc[p.category] = (acc[p.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          };
          
          setStats(newStats);
          
          if (updates) {
            setRecentUpdates(updates.map(u => ({
              ...u,
              project_title: Array.isArray(u.projects) ? u.projects[0]?.title : (u.projects as any)?.title
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching project stats:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();

    const channel1 = supabase.channel('stats-projects').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchStats).subscribe();
    const channel2 = supabase.channel('stats-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates' }, fetchStats).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, []);

  return { ...stats, recentUpdates, loading };
}
