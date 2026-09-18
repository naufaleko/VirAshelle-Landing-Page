import React, { createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { useCms, SiteContent } from './useCms';
import { User } from '@supabase/supabase-js';

type AdminContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithId: (id: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  content: SiteContent;
  updateContent: (newContent: SiteContent) => Promise<void>;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, error, loginWithId, logout } = useAuth();
  const { content, updateContent } = useCms();
  const [isAdminMode, setIsAdminMode] = React.useState(false);

  return (
    <AdminContext.Provider value={{ user, loading, error, loginWithId, logout, content, updateContent, isAdminMode, setIsAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
