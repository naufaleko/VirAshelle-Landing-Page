import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileEdit, FolderKanban, Receipt, ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '../../lib/useAdmin';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAdmin();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/cms', icon: FileEdit, label: 'CMS' },
    { to: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/admin/invoices', icon: Receipt, label: 'Invoice Maker' },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <>
      {/* Mobile toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-md border border-white/10 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen bg-zinc-950 border-r border-white/5 flex flex-col transition-all duration-300 z-40
          ${collapsed ? 'w-20' : 'w-60'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#4BD200]/20 border border-[#4BD200]/50 flex items-center justify-center">
                <span className="text-[#4BD200] font-bold">V</span>
              </div>
              <span className="text-white font-semibold whitespace-nowrap">Admin Panel</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-[#4BD200]/20 border border-[#4BD200]/50 flex items-center justify-center">
              <span className="text-[#4BD200] font-bold">V</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive ? 'bg-[#4BD200]/10 text-[#4BD200]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <a href="/" target="_blank" rel="noreferrer" 
             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
             title={collapsed ? "Back to Website" : undefined}>
            <ExternalLink size={20} className="shrink-0" />
            {!collapsed && <span>Website</span>}
          </a>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-800 rounded-full items-center justify-center border border-white/10 text-zinc-400 hover:text-white"
        >
          {collapsed ? '>' : '<'}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
