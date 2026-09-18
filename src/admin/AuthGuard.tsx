import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../lib/useAdmin';
import { Loader2 } from 'lucide-react';

export function AuthGuard() {
  const { user, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4BD200] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
