import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Download,
  Search,
  FileText,
  ExternalLink,
  Trash2,
  Building,
  Receipt,
  Eye,
  AlertCircle,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from 'lucide-react';
import { useFinance, CATEGORY_LABELS, formatRupiah, formatRpCompact } from '../hooks/useFinance';
import { useAdmin } from '../../lib/AdminContext';
import { TransactionModal } from '../components/TransactionModal';
import { BrandedDropdown } from '../components/BrandedDropdown';
import { CyberCashWave } from '../components/CyberCashWave';
import { useEscapeKey } from '../lib/useEscapeKey';
import { TransactionType } from '../types';

/*
 * Screen job: record cash movements and see whether the studio is solvent. The net cash
 * card is the focal element; the ledger below it is where the work happens.
 */
export function FinancePage() {
  const {
    transactions,
    summary,
    loading,
    error: loadError,
    live,
    refresh,
    createTransaction,
    deleteTransaction
  } = useFinance();
  const { user } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Account filter
      if (accountFilter !== 'all' && tx.account !== accountFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = tx.description?.toLowerCase().includes(q);
        const refMatch = tx.reference_no?.toLowerCase().includes(q);
        const accMatch = tx.account?.toLowerCase().includes(q);
        const creatorMatch = tx.created_by?.toLowerCase().includes(q);
        const catMatch = (CATEGORY_LABELS[tx.category] || tx.category).toLowerCase().includes(q);
        if (!descMatch && !refMatch && !accMatch && !creatorMatch && !catMatch) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortOrder === 'date_desc') {
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      }
      if (sortOrder === 'date_asc') {
        return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      }
      if (sortOrder === 'amount_desc') {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortOrder === 'amount_asc') {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });
  }, [transactions, typeFilter, categoryFilter, accountFilter, searchQuery, sortOrder]);

  // Unique Accounts for filter pills
  const availableAccounts = useMemo(() => {
    const accs = new Set<string>();
    transactions.forEach(t => {
      if (t.account) accs.add(t.account);
    });
    return Array.from(accs);
  }, [transactions]);

  // Financial Metrics & Ratios
  const profitMarginPct = summary.totalIncome > 0 
    ? Math.round((summary.netBalance / summary.totalIncome) * 100) 
    : 0;
  const incomeExpenseRatio = summary.totalExpense > 0 
    ? (summary.totalIncome / summary.totalExpense).toFixed(1) 
    : summary.totalIncome > 0 ? '∞' : '0.0';

  // Export to CSV
  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Nominal (IDR)', 'Akun', 'No Referensi', 'Deskripsi', 'Pencatat'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.transaction_date,
      tx.type === 'income' ? 'Uang Masuk' : 'Uang Keluar',
      CATEGORY_LABELS[tx.category] || tx.category,
      tx.amount,
      `"${tx.account}"`,
      `"${tx.reference_no || ''}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.created_by
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_VirAshelle_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteTransaction(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus transaksi. Periksa hak akses RLS Anda.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeProof = useCallback(() => setSelectedProof(null), []);
  const closeDeleteConfirm = useCallback(() => {
    if (!deleteLoading) setDeleteConfirmId(null);
  }, [deleteLoading]);
  useEscapeKey(!!selectedProof, closeProof);
  useEscapeKey(!!deleteConfirmId, closeDeleteConfirm);

  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;
  const hasActiveFilter = typeFilter !== 'all' || categoryFilter !== 'all' || accountFilter !== 'all' || searchQuery.trim() !== '';
  const topCategoryAmount = summary.categoryBreakdown[0]?.amount || 0;

  if (loading && transactions.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3" role="status">
        <div className="w-8 h-8 border-2 border-[#4BD200]/30 border-t-[#4BD200] rounded-full animate-spin" aria-hidden="true" />
        <span className="text-xs font-ui text-zinc-400">Memuat buku kas...</span>
      </div>
    );
  }

  if (loadError && transactions.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-[#111118] border border-red-500/30 rounded-2xl p-6 text-center space-y-3" role="alert">
        <AlertCircle size={28} className="mx-auto text-red-400" aria-hidden="true" />
        <h1 className="text-lg font-display font-bold text-white">Buku kas tidak bisa dimuat</h1>
        <p className="text-xs font-ui text-zinc-400">{loadError}</p>
        <p className="text-xs font-ui text-zinc-400">Periksa koneksi atau hak akses tabel financial_transactions, lalu coba lagi.</p>
        <button
          type="button"
          onClick={() => refresh()}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-ui font-semibold transition-colors"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-1.5">Laporan Keuangan</h1>
          <p className="text-xs sm:text-sm font-body text-zinc-400">
            Buku kas studio: pencatatan kas masuk dan keluar, rekening, dan bukti pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Marks a real state: the Supabase realtime channel for this table is subscribed or not. */}
          <span className="text-[11px] font-ui text-zinc-400 flex items-center gap-1.5" role="status">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-[#4BD200]' : 'bg-zinc-500'}`} aria-hidden="true" />
            {live ? 'Realtime aktif' : 'Realtime terputus'}
          </span>
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="px-4 py-2.5 bg-[#111118] hover:bg-[#16161e] border border-white/10 hover:border-[#4BD200]/30 text-zinc-300 hover:text-white rounded-xl text-xs font-ui font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unduh seluruh transaksi sebagai CSV"
          >
            <Download size={15} className="text-zinc-400" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 active:scale-95"
          >
            <Plus size={17} strokeWidth={2.5} aria-hidden="true" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-ui" role="alert">
          <span className="flex items-center gap-2"><AlertCircle size={16} aria-hidden="true" /> Pembaruan terakhir gagal: {loadError}</span>
          <button type="button" onClick={() => refresh()} className="font-bold hover:underline">Coba lagi</button>
        </div>
      )}

      {/* Focal card: the one green hairline on this page sits on the number the page exists for. */}
      <section aria-labelledby="saldo-heading" className="bg-[#111118] border border-white/10 rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4BD200]/60 to-transparent" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 lg:border-r lg:border-white/10 lg:pr-6">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 id="saldo-heading" className="text-xs font-ui font-semibold text-zinc-400">Saldo kas bersih</h2>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                summary.netBalance > 0
                  ? 'bg-[#4BD200]/15 text-[#4BD200] border border-[#4BD200]/30'
                  : summary.netBalance < 0
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
              }`}>
                {summary.netBalance > 0 ? 'Surplus' : summary.netBalance < 0 ? 'Defisit' : 'Seimbang'}
              </span>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight my-1">
              {formatRupiah(summary.netBalance)}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs font-ui text-zinc-400">
              <ShieldCheck size={14} className={summary.netBalance >= 0 ? 'text-[#4BD200] shrink-0' : 'text-amber-400 shrink-0'} aria-hidden="true" />
              <span>
                {summary.totalExpense > 0 && summary.netBalance > 0
                  ? `Estimasi runway ~${Math.max(1, Math.round(summary.netBalance / (summary.totalExpense / Math.max(1, summary.monthlyCashflow.filter(m => m.expense > 0).length || 1))))} bulan pada rata-rata beban bulanan tercatat`
                  : summary.netBalance < 0
                  ? 'Pengeluaran melebihi pemasukan yang tercatat'
                  : 'Belum ada beban pengeluaran tercatat'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-5 lg:pl-2">
            <div className="space-y-1">
              <h2 className="text-xs font-ui text-zinc-400">Kas masuk</h2>
              <div className="text-xl sm:text-2xl font-mono font-bold text-[#4BD200]">
                {formatRupiah(summary.totalIncome)}
              </div>
              <div className="text-[11px] font-ui text-zinc-400">{incomeCount} transaksi</div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-ui text-zinc-400">Kas keluar</h2>
              <div className="text-xl sm:text-2xl font-mono font-bold text-red-400">
                {formatRupiah(summary.totalExpense)}
              </div>
              <div className="text-[11px] font-ui text-zinc-400">{expenseCount} transaksi</div>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
              <h2 className="text-xs font-ui text-zinc-400">Marjin bersih</h2>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white">
                {profitMarginPct}%
              </div>
              <div className="text-[11px] font-ui text-zinc-400">
                Rasio masuk/keluar {incomeExpenseRatio}x
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="kurva-heading" className="bg-[#111118] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-visible z-10">
        <div className="mb-6">
          <h2 id="kurva-heading" className="text-lg font-display font-bold text-white tracking-tight">
            Kas masuk vs keluar per bulan
          </h2>
          <p className="text-xs font-body text-zinc-400 mt-1">
            6 bulan terakhir. Arahkan atau fokus ke titik bulan untuk rinciannya.
          </p>
        </div>

        <CyberCashWave data={summary.monthlyCashflow} height={300} showControls={true} />

        {/* Ranked bars: length tells the categories apart, so no rainbow legend is needed. */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-ui font-bold text-white">Ke mana kas keluar</h3>
            <span className="text-[11px] font-mono text-zinc-400">Total keluar {formatRupiah(summary.totalExpense)}</span>
          </div>

          {summary.categoryBreakdown.length > 0 ? (
            <ul className="space-y-2.5">
              {summary.categoryBreakdown.map((item) => (
                <li key={item.category} className="text-xs font-ui">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-zinc-300 truncate">{item.name}</span>
                    <span className="font-mono text-zinc-400 shrink-0">
                      {item.percentage.toFixed(0)}% · {formatRpCompact(item.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{ width: `${topCategoryAmount > 0 ? (item.amount / topCategoryAmount) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-xs font-ui text-zinc-400 bg-[#0a0a0f] border border-white/5 rounded-xl">
              Belum ada pengeluaran tercatat. Catat transaksi keluar dan rinciannya muncul di sini.
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="ledger-heading" className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="ledger-heading" className="text-base sm:text-lg font-display font-bold text-white">
                Buku kas
                <span className="ml-2 text-xs font-mono font-normal text-zinc-400">{filteredTransactions.length} dari {transactions.length}</span>
              </h2>
              <p className="text-xs font-body text-zinc-400 mt-0.5">
                Semua mutasi kas dengan nomor nota, rekening, dan lampiran bukti.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#0a0a0f] rounded-xl border border-white/10 self-start sm:self-auto" role="group" aria-label="Filter jenis transaksi">
              <button
                onClick={() => setTypeFilter('all')}
                aria-pressed={typeFilter === 'all'}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui font-bold transition-colors min-h-[36px] flex items-center justify-center ${
                  typeFilter === 'all' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                aria-pressed={typeFilter === 'income'}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui font-bold transition-colors min-h-[36px] flex items-center gap-1.5 ${
                  typeFilter === 'income' ? 'bg-[#4BD200] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft size={13} strokeWidth={2.5} aria-hidden="true" />
                Masuk
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                aria-pressed={typeFilter === 'expense'}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui font-bold transition-colors min-h-[36px] flex items-center gap-1.5 ${
                  typeFilter === 'expense' ? 'bg-[#ff3344] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ArrowUpRight size={13} strokeWidth={2.5} aria-hidden="true" />
                Keluar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Cari deskripsi, no. nota, rekening..."
                aria-label="Cari transaksi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-ui text-white placeholder:text-dim focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200] transition-colors"
              />
            </div>

            <BrandedDropdown
              size="sm"
              ariaLabel="Filter kategori"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[{ value: 'all', label: 'Semua Kategori' }, ...Object.entries(CATEGORY_LABELS).map(([k, label]) => ({ value: k, label }))]}
            />

            <BrandedDropdown
              size="sm"
              ariaLabel="Filter rekening"
              value={accountFilter}
              onChange={setAccountFilter}
              options={[{ value: 'all', label: 'Semua Rekening' }, ...availableAccounts.map((acc) => ({ value: acc, label: acc }))]}
            />

            <BrandedDropdown
              size="sm"
              ariaLabel="Urutan"
              value={sortOrder}
              onChange={(v) => setSortOrder(v as typeof sortOrder)}
              options={[
                { value: 'date_desc', label: 'Urutkan: Tanggal Terbaru' },
                { value: 'date_asc', label: 'Urutkan: Tanggal Terlama' },
                { value: 'amount_desc', label: 'Urutkan: Nominal Tertinggi' },
                { value: 'amount_asc', label: 'Urutkan: Nominal Terendah' },
              ]}
            />
          </div>
        </div>

        {deleteError && (
          <div className="m-5 flex items-center justify-between p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-ui" role="alert">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{deleteError}</span>
            </div>
            <button onClick={() => setDeleteError(null)} className="hover:underline text-[11px] font-bold">
              Tutup
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0a0a0f] text-[11px] font-ui font-bold text-zinc-400">
                <th scope="col" className="px-5 py-3.5">Tanggal</th>
                <th scope="col" className="px-5 py-3.5">Jenis</th>
                <th scope="col" className="px-5 py-3.5">Deskripsi & Referensi</th>
                <th scope="col" className="px-5 py-3.5 text-right">Nominal</th>
                <th scope="col" className="px-5 py-3.5">Kategori</th>
                <th scope="col" className="px-5 py-3.5">Rekening</th>
                <th scope="col" className="px-5 py-3.5 text-center">Pencatat</th>
                <th scope="col" className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-[#4BD200]/[0.03] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-300 font-mono">
                      {tx.transaction_date}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-ui font-bold ${
                        isIncome
                          ? 'bg-[#4BD200]/10 text-[#4BD200] border border-[#4BD200]/25'
                          : 'bg-red-500/10 text-red-400 border border-red-500/25'
                      }`}>
                        {isIncome ? <ArrowDownLeft size={11} aria-hidden="true" /> : <ArrowUpRight size={11} aria-hidden="true" />}
                        {isIncome ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 max-w-[280px]">
                      <p className="text-xs font-ui font-medium text-white truncate" title={tx.description}>
                        {tx.description}
                      </p>
                      {tx.reference_no && (
                        <p className="text-[11px] font-mono text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                          <FileText size={11} aria-hidden="true" />
                          {tx.reference_no}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-bold font-mono">
                      <span className={isIncome ? 'text-[#4BD200]' : 'text-red-400'}>
                        {isIncome ? '+' : '-'} {formatRupiah(Number(tx.amount))}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-300">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/5 font-ui text-[11px]">
                        {CATEGORY_LABELS[tx.category] || tx.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-400 font-ui">
                      <span className="flex items-center gap-1.5">
                        <Building size={13} className="text-zinc-400" aria-hidden="true" />
                        {tx.account}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 font-mono text-[11px]">
                        {tx.created_by.split('@')[0]}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs">
                      <div className="flex items-center justify-center gap-2">
                        {tx.attachment_url && (
                          <button
                            onClick={() => setSelectedProof(tx.attachment_url || null)}
                            className="p-1.5 rounded-lg bg-[#0a0a0f] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Lihat bukti nota / transfer"
                            aria-label="Lihat bukti nota / transfer"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmId(tx.id)}
                          className="p-1.5 rounded-lg bg-[#0a0a0f] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                          title="Hapus transaksi"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && !loading && (
          <div className="px-5 py-12 text-center text-zinc-400 text-xs font-ui">
            {hasActiveFilter ? (
              <p>Tidak ada transaksi yang cocok dengan filter ini. Ubah kata kunci atau pilih "Semua".</p>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <p>Buku kas masih kosong.</p>
                <button type="button" onClick={() => setIsModalOpen(true)} className="text-[#4BD200] hover:underline font-semibold">Catat transaksi pertama</button>
              </div>
            )}
          </div>
        )}
      </section>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTransaction}
        userEmail={user?.email ?? ''}
      />

      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85" role="dialog" aria-modal="true" aria-labelledby="proof-heading" onMouseDown={(e) => { if (e.target === e.currentTarget) closeProof(); }}>
          <div className="relative max-w-2xl w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 id="proof-heading" className="text-base font-display font-bold text-white flex items-center gap-2">
                <Receipt size={18} className="text-[#4BD200]" aria-hidden="true" />
                Bukti lampiran transaksi
              </h3>
              <button
                onClick={closeProof}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>
            <div className="py-6 flex justify-center">
              <img
                src={selectedProof}
                alt="Bukti nota atau transfer"
                className="max-h-[500px] w-auto rounded-xl object-contain border border-white/10"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="hidden text-center py-8 text-zinc-400 text-xs font-ui">
                <p>Pratinjau gambar tidak bisa dimuat dari tautan ini.</p>
                <a
                  href={selectedProof}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[#4BD200] hover:text-[#7cff33] underline text-xs font-semibold"
                >
                  Buka tautan di tab baru <ExternalLink size={13} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={closeProof}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-ui font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85" role="dialog" aria-modal="true" aria-labelledby="delete-heading">
          <div className="relative max-w-md w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
            <h3 id="delete-heading" className="text-base font-display font-bold text-white mb-2">Hapus transaksi?</h3>
            <p className="text-xs font-body text-zinc-400 mb-6 leading-relaxed">
              Transaksi ini akan dihapus permanen dari buku kas. Penghapusan hanya berhasil jika akun Anda punya hak akses (RLS).
            </p>
            <div className="flex items-center justify-end gap-3 font-ui">
              <button
                onClick={closeDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-[#ff3344] hover:bg-[#ff4d60] text-black text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
