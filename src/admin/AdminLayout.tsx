import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { useAdmin } from '../lib/AdminContext';

const SECTION_LABELS: Record<string, string> = {
  cms: 'CMS',
  projects: 'Proyek',
  invoices: 'Invoice',
  finance: 'Laporan Keuangan',
};

type Crumb = { label: string; to?: string };

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean).slice(1);
  if (segments.length === 0) return [{ label: 'Ringkasan' }];

  const [section, ...rest] = segments;
  const label = SECTION_LABELS[section] || section.charAt(0).toUpperCase() + section.slice(1);

  if (section === 'projects' && rest.length > 0) {
    return [{ label, to: '/admin/projects' }, { label: 'Detail Proyek' }];
  }
  return [{ label }];
}

export function AdminLayout() {
  const { user, profile, role } = useAdmin();
  const location = useLocation();

  const crumbs = buildCrumbs(location.pathname);

  return (
    // Flat black work surface: nothing behind the cards, so cards stay solid and unshadowed.
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex font-body relative overflow-x-hidden selection:bg-brand selection:text-black">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Sticky header is the one glass surface in the admin: page content scrolls under it. */}
        <header className="h-16 pl-14 pr-6 md:px-8 border-b border-white/[0.08] flex items-center justify-between sticky top-0 bg-[#0a0a0f]/85 backdrop-blur-xl z-30">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs font-ui">
            <span className="text-dim hidden md:inline">VirAshelle Admin</span>
            <span className="text-dim mx-2.5 hidden md:inline" aria-hidden="true">/</span>
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <span key={`${crumb.label}-${i}`} className="flex items-center">
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to} className="text-zinc-400 hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-white font-bold' : 'text-zinc-400'} aria-current={isLast ? 'page' : undefined}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <span className="text-dim mx-2" aria-hidden="true">/</span>}
                </span>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[11px] font-mono font-medium text-zinc-300">
                {profile?.name || user?.email?.split('@')[0]}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#4BD200]/15 text-[#4BD200] border border-[#4BD200]/30">
                {role.replace('_', ' ')}
              </span>
            </div>

            <div className="w-8 h-8 rounded-xl bg-[#111118] border border-white/10 flex items-center justify-center text-xs font-bold text-[#4BD200]" aria-hidden="true">
              {(profile?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
