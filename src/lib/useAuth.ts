import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

const INVALID_CREDENTIALS_MESSAGE = 'ID atau password salah!';
const ALIAS_UNAVAILABLE_MESSAGE = 'Login dengan ID belum aktif di server ini. Masuk dengan alamat email.';

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
    setError(null);

    // A full email goes straight to Auth. A short ID is resolved server-side from
    // admin_users (display_alias / login_aliases, migration 008), so no account
    // list lives in this bundle. The password is verified only by Supabase Auth.
    let email = cleanId;
    if (!cleanId.includes('@')) {
      const { data, error: rpcError } = await supabase.rpc('resolve_login_id', { p_id: cleanId });
      if (rpcError) {
        console.warn('resolve_login_id() unavailable (apply migration 008_auth_in_supabase.sql):', rpcError.message);
        setError(ALIAS_UNAVAILABLE_MESSAGE);
        throw new Error(ALIAS_UNAVAILABLE_MESSAGE);
      }
      if (typeof data !== 'string' || !data) {
        setError(INVALID_CREDENTIALS_MESSAGE);
        throw new Error(INVALID_CREDENTIALS_MESSAGE);
      }
      email = data;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (signInError) {
      const message = signInError.message.includes('Invalid login credentials')
        ? INVALID_CREDENTIALS_MESSAGE
        : signInError.message;
      setError(message);
      throw new Error(message);
    }
    return data;
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
