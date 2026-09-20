import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdmin } from '../lib/useAdmin';
import { supabase } from '../lib/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

type AdminCheck = 'pending' | 'allowed' | 'denied';

export function AuthGuard() {
  const { user, loading, logout } = useAdmin();
  const location = useLocation();
  const [adminCheck, setAdminCheck] = useState<AdminCheck>('pending');

  // Second gate after the session check: is this account whitelisted in admin_users?
  // Uses public.is_admin() from migration 002. If the RPC does not exist yet (migration
  // not applied) we let the user through so the dashboard keeps working; RLS from 001
  // still applies in that case.
  useEffect(() => {
    if (!user) {
      setAdminCheck('pending');
      return;
    }
    let cancelled = false;
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.warn('is_admin() check unavailable (apply migration 002_admin_access.sql):', error.message);
        setAdminCheck('allowed');
        return;
      }
      setAdminCheck(data === true ? 'allowed' : 'denied');
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading || (user && adminCheck === 'pending')) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-3" role="status">
        <Loader2 className="w-8 h-8 text-[#4BD200] animate-spin" aria-hidden="true" />
        <span className="text-xs font-ui text-zinc-400">Memeriksa sesi dan hak akses...</span>
      </div>
    );
  }

  if (!user) {
    // Remember where the visitor was heading so LoginPage can send them back.
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (adminCheck === 'denied') {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4" role="alert">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" aria-hidden="true" />
          <h1 className="text-xl font-bold text-white">Akses ditolak</h1>
          <p className="text-sm text-zinc-400">
            Akun <span className="text-zinc-200">{user.email}</span> tidak terdaftar sebagai admin.
            Minta pemilik untuk menambahkan email ini ke tabel <code className="text-[#4BD200]">admin_users</code>.
          </p>
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
