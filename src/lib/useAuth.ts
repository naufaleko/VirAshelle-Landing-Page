import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithId = async (id: string, pass: string) => {
    const cleanId = id.trim().toLowerCase();
    if ((cleanId === 'virashelle' || cleanId === 'admin@virashelle.com') && pass === 'nfmj@04290126') {
      const email = 'admin@virashelle.com';
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      
      if (signInError) {
        setError(signInError.message);
        throw signInError;
      }
      return data;
    } else {
      const err = new Error("ID atau password salah!");
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return { user, loading, error, loginWithId, logout };
}
