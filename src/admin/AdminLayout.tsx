import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { useAdmin } from '../lib/useAdmin';

export function AdminLayout() {
  const { user } = useAdmin();
  const location = useLocation();
  
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumb = pathnames.length > 1 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : 'Overview';

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 pl-14 pr-6 md:px-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-20">
          <div className="flex items-center text-sm">
            <span className="text-zinc-500 hidden md:inline">Admin</span>
            <span className="text-zinc-500 mx-2 hidden md:inline">/</span>
            <span className="text-white font-medium">{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">
              {user?.email}
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
