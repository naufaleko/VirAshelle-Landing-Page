import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { TeamMember } from '../types';

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMembers() {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (isMounted && data) setMembers(data as TeamMember[]);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  return { members, loading };
}
