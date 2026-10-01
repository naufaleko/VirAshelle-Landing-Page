import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useCms, SiteContent } from './useCms';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { UserProfile, UserRole } from '../admin/types';

type AdminContextType = {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isCLevel: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  loginWithId: (id: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  content: SiteContent;
  /** True until the live site_content row has been read; content holds the fallback until then. */
  contentLoading: boolean;
  /** Set when the live row could not be read; content is the fallback, so it must not be saved. */
  contentError: string | null;
  updateContent: (newContent: SiteContent) => Promise<void>;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  refreshProfile: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, error, loginWithId, logout } = useAuth();
  const { content, loading: contentLoading, error: contentError, updateContent } = useCms();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_my_profile');
      if (!rpcError && data) {
        setProfile(data as UserProfile);
      } else {
        // Role and name come only from admin_users (migration 004). Without a row the
        // account is treated as plain staff; RLS on the server decides what it may touch.
        if (rpcError) console.warn('get_my_profile() unavailable (apply migration 004):', rpcError.message);
        const email = user.email || '';
        setProfile({ email, role: 'staff', name: email.split('@')[0] });
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const role: UserRole = profile?.role || 'staff';
  const isCLevel = role === 'c_level' || role === 'superadmin';
  const isAdmin = isCLevel || role === 'marketing' || role === 'production';

  return (
    <AdminContext.Provider 
      value={{ 
        user, 
        profile, 
        role, 
        isCLevel, 
        isAdmin, 
        loading: authLoading || profileLoading, 
        error, 
        loginWithId, 
        logout, 
        content,
        contentLoading,
        contentError,
        updateContent,
        isAdminMode, 
        setIsAdminMode,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
