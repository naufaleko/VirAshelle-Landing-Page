/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Building2,
  LayoutDashboard,
  NotebookPen,
  ReceiptText,
  Scale,
  ScrollText,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

// Deployed URL of the VirAshelle WebAcc finance app.
// Set VITE_FINANCE_APP_URL once WebAcc is deployed; defaults to the local dev server.
const FINANCE_URL = import.meta.env.VITE_FINANCE_APP_URL || 'http://localhost:3000';

// Mirrors the nav taxonomy defined in webacc/src/components/layout/app-sidebar.tsx
// so the two apps stay conceptually in sync.
const NAV_GROUPS = [
  {
    label: 'Menu',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Transaksi',
    items: [
      { href: '/kas-bank', label: 'Kas & Bank', icon: Wallet },
      { href: '/penjualan', label: 'Penjualan', icon: ReceiptText },
      { href: '/pembelian', label: 'Pembelian', icon: ShoppingCart },
      { href: '/jurnal-umum', label: 'Jurnal Umum', icon: NotebookPen },
    ],
  },
  {
    label: 'Data Master',
    items: [
      { href: '/akun', label: 'Daftar Akun', icon: BookOpen },
      { href: '/pelanggan', label: 'Pelanggan', icon: Users },
      { href: '/pemasok', label: 'Pemasok', icon: Truck },
      { href: '/aktiva-tetap', label: 'Aktiva Tetap', icon: Building2 },
    ],
  },
  {
    label: 'Laporan',
    items: [
      { href: '/piutang', label: 'Piutang', icon: ScrollText },
      { href: '/hutang', label: 'Hutang', icon: ScrollText },
      { href: '/laporan/laba-rugi', label: 'Laba Rugi', icon: BarChart3 },
      { href: '/laporan/neraca', label: 'Neraca', icon: Scale },
      { href: '/laporan/arus-kas', label: 'Arus Kas', icon: ArrowLeftRight },
      { href: '/laporan/buku-besar', label: 'Buku Besar', icon: BookMarked },
    ],
  },
] as const;

export function FinancePanel() {
  return (
    <div className="pb-20 space-y-8">
      {/* Intro / Launcher Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 bg-[#7d39eb]/20 rounded-2xl flex items-center justify-center border border-[#7d39eb]/50 shadow-[0_0_20px_rgba(125,57,235,0.3)]">
            <Wallet className="text-[#7d39eb]" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold tracking-tight">VirAshelle Finance</h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-lg">
              Pembukuan, invoice, kas/bank, dan laporan keuangan VirAshelle. Dikelola di aplikasi
              terpisah — login memakai akun Finance (bukan akun CMS ini).
            </p>
          </div>
        </div>
        <a
          href={`${FINANCE_URL}/dashboard`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center justify-center gap-2 bg-[#7d39eb] hover:bg-[#6c2bd9] text-white px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(125,57,235,0.4)] transition-all hover:scale-[1.02] active:scale-95"
        >
          Buka Finance Dashboard <ArrowUpRight size={16} />
        </a>
      </motion.div>

      {/* Quick links grouped exactly like WebAcc's own sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {NAV_GROUPS.map((group, gi) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: gi * 0.05 }}
            className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 space-y-3"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 px-1">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <a
                  key={item.href}
                  href={`${FINANCE_URL}${item.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <item.icon size={16} className="text-[#7d39eb] shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ArrowUpRight
                    size={14}
                    className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600 uppercase tracking-widest font-ui">
        Setiap tautan membuka VirAshelle Finance di tab baru
      </p>
    </div>
  );
}
