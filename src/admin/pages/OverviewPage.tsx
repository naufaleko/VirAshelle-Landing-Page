import { Link } from 'react-router-dom';
import { Plus, Wallet, Receipt, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useProjectStats } from '../hooks/useProjectStats';
import { useFinance, formatRupiah } from '../hooks/useFinance';
import { useAdmin } from '../../lib/AdminContext';
import { CyberCashWave } from '../components/CyberCashWave';
import { STATUS_COLORS, STATUS_OPTIONS } from '../lib/projectStatus';

/*
 * Screen job: the director opens this to answer two questions, "is cash fine?" and
 * "which projects need attention?". Net cash is the focal number; overdue projects is the
 * attention metric. Completion rate was dropped: it is a vanity ratio with no decision behind it.
 */
export function OverviewPage() {
  const { total, active, completed, overdue, byStatus, recentUpdates, loading: projectsLoading, error: projectsError } = useProjectStats();
  const { summary, transactions, loading: financeLoading, error: financeError } = useFinance();
  const { profile } = useAdmin();

  if (projectsLoading || financeLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3" role="status">
        <div className="w-8 h-8 border-2 border-[#4BD200]/30 border-t-[#4BD200] rounded-full animate-spin" aria-hidden="true" />
        <span className="text-xs font-ui text-zinc-400">Memuat ringkasan kas dan proyek...</span>
      </div>
    );
  }

  const loadError = projectsError || financeError;
  if (loadError) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-[#111118] border border-red-500/30 rounded-2xl p-6 text-center space-y-3" role="alert">
        <AlertCircle size={28} className="mx-auto text-red-400" aria-hidden="true" />
        <h1 className="text-lg font-display font-bold text-white">Ringkasan tidak bisa dimuat</h1>
        <p className="text-xs font-ui text-zinc-400">{loadError}</p>
        <p className="text-xs font-ui text-zinc-400">Periksa koneksi atau hak akses Supabase, lalu coba lagi.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-ui font-semibold transition-colors"
        >
          Muat ulang
        </button>
      </div>
    );
  }

  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const statusRows = STATUS_OPTIONS.map((o) => ({ ...o, count: byStatus[o.value] || 0 })).filter((r) => r.count > 0);
  const maxStatus = Math.max(1, ...statusRows.map((r) => r.count));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-1.5">Ringkasan</h1>
          <p className="text-xs sm:text-sm font-body text-zinc-400">
            Selamat datang, <span className="text-white font-medium">{profile?.name || 'Admin'}</span>. Posisi kas studio dan status proyek saat ini.
          </p>
        </div>

        {/* One filled button per screen: the action the director takes most often here. */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/admin/finance"
            className="px-3.5 py-2 bg-[#111118] hover:bg-[#16161e] border border-white/10 hover:border-[#4BD200]/30 rounded-xl text-xs font-ui font-semibold text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Wallet size={14} className="text-[#4BD200]" aria-hidden="true" /> Catat Kas
          </Link>
          <Link
            to="/admin/invoices"
            className="px-3.5 py-2 bg-[#111118] hover:bg-[#16161e] border border-white/10 hover:border-[#4BD200]/30 rounded-xl text-xs font-ui font-semibold text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Receipt size={14} className="text-[#4BD200]" aria-hidden="true" /> Buat Invoice
          </Link>
          <Link
            to="/admin/projects?new=true"
            className="px-4 py-2 bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={15} strokeWidth={2.5} aria-hidden="true" /> Proyek Baru
          </Link>
        </div>
      </div>

      {/* Focal card. The green hairline is the admin's one identity mark: it sits on the single
          card per page that holds the number the page exists for. */}
      <section aria-labelledby="kas-heading" className="bg-[#111118] border border-white/10 rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4BD200]/60 to-transparent" aria-hidden="true" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="space-y-1 md:pr-4">
            <div className="flex items-center justify-between gap-2">
              <h2 id="kas-heading" className="text-xs font-ui font-semibold text-zinc-400">Saldo kas bersih</h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                summary.netBalance > 0
                  ? 'text-[#4BD200] bg-[#4BD200]/10 border-[#4BD200]/25'
                  : summary.netBalance < 0
                  ? 'text-red-400 bg-red-500/10 border-red-500/25'
                  : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25'
              }`}>
                {summary.netBalance > 0 ? 'Surplus' : summary.netBalance < 0 ? 'Defisit' : 'Seimbang'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatRupiah(summary.netBalance)}
            </div>
            <div className="flex items-center justify-between text-[11px] font-ui text-zinc-400 pt-1">
              <span>Seluruh transaksi tercatat</span>
              <Link to="/admin/finance" className="text-[#4BD200] hover:underline font-semibold">Lihat</Link>
            </div>
          </div>

          <div className="space-y-1 pt-4 md:pt-0 md:px-6">
            <h2 className="text-xs font-ui font-semibold text-zinc-400">Kas masuk</h2>
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#4BD200] tracking-tight">
              {formatRupiah(summary.totalIncome)}
            </div>
            <div className="text-[11px] font-ui text-zinc-400 pt-1">
              {incomeCount} transaksi masuk
            </div>
          </div>

          <div className="space-y-1 pt-4 md:pt-0 md:px-6">
            <h2 className="text-xs font-ui font-semibold text-zinc-400">Proyek aktif</h2>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {active} <span className="text-base text-dim font-normal">/ {total}</span>
            </div>
            <div className="text-[11px] font-ui text-zinc-400 pt-1">
              {completed} selesai
            </div>
          </div>

          <div className="space-y-1 pt-4 md:pt-0 md:pl-6">
            <h2 className="text-xs font-ui font-semibold text-zinc-400">Lewat tenggat</h2>
            <div className={`text-2xl sm:text-3xl font-display font-bold tracking-tight ${overdue > 0 ? 'text-red-400' : 'text-white'}`}>
              {overdue}
            </div>
            <div className="flex items-center justify-between text-[11px] font-ui text-zinc-400 pt-1">
              <span>{overdue > 0 ? 'Belum selesai, tenggat terlewat' : 'Semua proyek masih dalam tenggat'}</span>
              {overdue > 0 && (
                <Link to="/admin/projects" className="text-[#4BD200] hover:underline font-semibold">Cek</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section aria-labelledby="arus-kas-heading" className="lg:col-span-8 bg-[#111118] border border-white/10 rounded-2xl p-6 relative overflow-visible z-10">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 id="arus-kas-heading" className="text-base font-display font-bold text-white tracking-tight">
                Kas masuk vs keluar per bulan
              </h2>
              <p className="text-xs font-body text-zinc-400 mt-1">6 bulan terakhir. Arahkan ke titik bulan untuk rinciannya.</p>
            </div>
            <Link to="/admin/finance" className="text-xs font-ui font-bold text-[#4BD200] hover:text-[#7cff33] transition-colors shrink-0">
              Laporan lengkap
            </Link>
          </div>

          <CyberCashWave data={summary.monthlyCashflow} height={240} showControls={true} compact={true} />
        </section>

        {/* A ranked list answers "where is the pipeline?" faster than a donut of six greens. */}
        <section aria-labelledby="tahap-heading" className="lg:col-span-4 bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 id="tahap-heading" className="text-base font-display font-bold text-white">Proyek per tahap</h2>
            <Link to="/admin/projects" className="text-xs font-ui font-semibold text-zinc-400 hover:text-[#4BD200] transition-colors">
              Semua proyek
            </Link>
          </div>

          {statusRows.length > 0 ? (
            <ul className="space-y-3">
              {statusRows.map((row) => (
                <li key={row.value} className="text-xs font-ui">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2 text-zinc-300">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[row.value] }} aria-hidden="true" />
                      {row.label}
                    </span>
                    <span className="font-mono font-bold text-white">{row.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(row.count / maxStatus) * 100}%`, backgroundColor: STATUS_COLORS[row.value] }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs font-ui text-zinc-400 py-8 gap-2">
              <p>Belum ada proyek tercatat.</p>
              <Link to="/admin/projects?new=true" className="text-[#4BD200] hover:underline font-semibold">Buat proyek pertama</Link>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-labelledby="tx-heading" className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 id="tx-heading" className="text-base font-display font-bold text-white">Transaksi terbaru</h2>
            <Link to="/admin/finance" className="text-xs font-ui font-bold text-[#4BD200] hover:text-[#7cff33] transition-colors">
              Buku kas
            </Link>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0a0f] border border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-[#4BD200]/10 text-[#4BD200] border border-[#4BD200]/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`} aria-hidden="true">
                      {isIncome ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-ui font-semibold text-white truncate">{tx.description}</p>
                      <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                        {tx.transaction_date} · {tx.account}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold font-mono ${isIncome ? 'text-[#4BD200]' : 'text-red-400'}`}>
                      {isIncome ? '+' : '-'} {formatRupiah(Number(tx.amount))}
                    </p>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      oleh {tx.created_by.split('@')[0]}
                    </span>
                  </div>
                </div>
              );
            })}

            {transactions.length === 0 && (
              <div className="text-center py-8 text-xs font-ui text-zinc-400 space-y-2">
                <p>Belum ada transaksi tercatat.</p>
                <Link to="/admin/finance" className="text-[#4BD200] hover:underline font-semibold inline-block">Catat transaksi pertama</Link>
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="updates-heading" className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 id="updates-heading" className="text-base font-display font-bold text-white">Pembaruan proyek terbaru</h2>
            <Link to="/admin/projects" className="text-xs font-ui font-semibold text-zinc-400 hover:text-[#4BD200] transition-colors">
              Semua proyek
            </Link>
          </div>

          <div className="space-y-3">
            {recentUpdates.slice(0, 5).map((update) => (
              <div key={update.id} className="p-3.5 rounded-xl bg-[#0a0a0f] border border-white/5 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-white/10" aria-hidden="true">
                  {update.author.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1 text-xs font-ui">
                    <span className="font-semibold text-white">{update.author}</span>
                    <span className="text-zinc-400">pada</span>
                    <Link to={`/admin/projects/${update.project_id}`} className="text-[#4BD200] hover:underline font-medium truncate max-w-full">
                      {update.project_title || 'Proyek'}
                    </Link>
                  </div>
                  <p className="text-xs font-body text-zinc-400 line-clamp-1">{update.message}</p>
                  <p className="text-[10px] font-mono text-dim mt-1">
                    {new Date(update.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}

            {recentUpdates.length === 0 && (
              <div className="text-center py-8 text-xs font-ui text-zinc-400 space-y-2">
                <p>Belum ada pembaruan proyek.</p>
                <p>Pembaruan muncul di sini saat tim mencatat progres di halaman proyek.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
