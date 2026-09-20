import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileEdit,
  FolderKanban,
  Receipt,
  Wallet,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '../../lib/AdminContext';
import { useEscapeKey } from '../lib/useEscapeKey';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, profile, role } = useAdmin();

  useEscapeKey(mobileOpen, () => setMobileOpen(false));

  // Icons are wayfinding for the nav rows, not feature decoration; each glyph names the
  // section it opens (dashboard grid, wallet, receipt, kanban folder, editor).
  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Ringkasan', end: true },
    { to: '/admin/finance', icon: Wallet, label: 'Laporan Keuangan' },
    { to: '/admin/invoices', icon: Receipt, label: 'Invoice' },
    { to: '/admin/projects', icon: FolderKanban, label: 'Proyek' },
    { to: '/admin/cms', icon: FileEdit, label: 'CMS' },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <>
      <button
        className="md:hidden fixed top-3.5 left-4 z-50 p-2.5 bg-[#111118] rounded-xl border border-white/10 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#0a0a0f] border-r border-white/[0.08] flex flex-col transition-all duration-300 z-40
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand mark: the public site's "V" in the accent, flat. */}
        <div className="p-5 flex items-center justify-between border-b border-white/[0.08]">
          <div className={`flex items-center gap-3 ${collapsed ? 'mx-auto' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-[#4BD200]/15 border border-[#4BD200]/50 flex items-center justify-center" aria-hidden="true">
              <span className="text-[#4BD200] font-black text-base tracking-tighter">V</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-white font-display font-bold text-sm tracking-tight block">VirAshelle</span>
                <span className="text-[11px] text-dim font-ui block">Admin studio</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-xs font-ui
                ${isActive
                  // Left edge marks the active route: it carries state, so it stays.
                  ? 'bg-white/[0.06] text-[#4BD200] border-l-2 border-[#4BD200] font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`
              }
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && profile && (
          <div className="mx-3.5 mb-3 p-3 bg-[#111118] rounded-xl border border-white/[0.08] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#000000] border border-white/10 text-[#4BD200] font-bold text-xs flex items-center justify-center shrink-0" aria-hidden="true">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{profile.name}</p>
              <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                {role.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}

        <div className="p-3.5 border-t border-white/[0.08] space-y-1">
          <a href="/" target="_blank" rel="noreferrer"
             className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-ui text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
             title={collapsed ? 'Website publik' : undefined}
             aria-label={collapsed ? 'Website publik' : undefined}>
            <ExternalLink size={16} className="shrink-0" />
            {!collapsed && <span>Website publik</span>}
          </a>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-ui text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            title={collapsed ? 'Keluar' : undefined}
            aria-label={collapsed ? 'Keluar' : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>

        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#111118] rounded-full items-center justify-center border border-white/15 text-zinc-400 hover:text-white z-20 cursor-pointer"
          aria-label={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
