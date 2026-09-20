import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Save,
  FolderOpen,
  Plus,
  Trash2,
  Building2,
  Receipt,
  CreditCard,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FolderInput,
  Percent,
  Upload,
  Check,
  Database,
  History,
  FilePlus,
  X,
  Loader2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useInvoices } from '../hooks/useInvoices';
import { BrandedDropdown } from '../components/BrandedDropdown';

// SVG Vector for default VirAshelle Monogram
const VIRASHELLE_SVG_PATH = (
  <>
    <path d="M11.07 20.67H6.88c-1.06 0-1.1.05-.57.93 2.37 3.9 4.75 7.79 7.13 11.69 3.5 5.73 7 11.45 10.5 17.18 2.12 3.48 4.24 6.97 6.35 10.46.31.51.67.78 1.29.76.99-.03 1.99-.02 2.98.04.87.06 1.37-.32 1.81-1.04 2.94-4.84 5.91-9.66 8.87-14.49 5.97-9.75 11.95-19.51 17.92-29.26C66.41 11.63 69.66 6.31 72.9 1c.15-.24.44-.5.27-.79-.17-.3-.54-.18-.82-.18-2.74 0-5.48.01-8.22-.02-.73 0-1.18.26-1.56.88-2.33 3.86-4.68 7.71-7.03 11.56-2.73 4.47-5.46 8.94-8.19 13.4-3.32 5.43-6.65 10.85-9.98 16.27-1.17 1.9-2.33 3.8-3.51 5.69-.51.82-.63.82-1.16.06-.06-.09-.13-.17-.18-.27-1.86-3.05-3.71-6.1-5.57-9.15-3.46-5.68-6.94-11.37-10.39-17.06-.31-.51-.7-.75-1.31-.74-1.4.03-2.79 0-4.19 0ZM118.6 61.6c.01-.26-.19-.39-.32-.54-1.8-2.07-3.62-4.11-5.39-6.2-.54-.64-1.13-.86-1.95-.86-8.32.02-16.65 0-24.97.03-.81 0-1.33-.23-1.75-.97-4.15-7.21-8.33-14.41-12.53-21.59-.4-.68-.42-1.22 0-1.91 3.27-5.3 6.51-10.62 9.76-15.93 2.59-4.24 5.19-8.47 7.78-12.7.48-.79.42-.89-.51-.89h-8.46c-.6 0-1 .21-1.32.73-2.29 3.76-4.59 7.51-6.89 11.26-3.54 5.79-7.07 11.6-10.64 17.37-.47.76-.52 1.34-.03 2.12 2.19 3.5 4.32 7.05 6.48 10.57 3.56 5.84 7.21 11.64 10.64 17.56.98 1.69 2.1 2.12 3.9 2.11 11.79-.06 23.58-.03 35.37-.04.28 0 .59.1.84-.12Z" />
    <path d="M91.53 45.96c1.48 0 2.95.01 4.43 0 .76 0 .82-.15.44-.79-2.76-4.57-5.5-9.15-8.27-13.72-.32-.53-.33-.96 0-1.48.58-.9 1.13-1.83 1.68-2.75 3.32-5.52 6.65-11.03 9.97-16.55.13-.22.4-.44.23-.72-.16-.28-.49-.17-.74-.18-2.55 0-5.1.06-7.65-.03-1.2-.04-1.9.36-2.52 1.38-3.77 6.28-7.61 12.52-11.43 18.77-.34.55-.35 1.03-.02 1.57 2.85 4.61 5.69 9.23 8.51 13.85.29.48.66.65 1.19.64 1.4-.02 2.79 0 4.19 0ZM5.05 37.8v.09H.78c-.91 0-.96.11-.48.91 1.36 2.25 2.74 4.49 4.11 6.73 3.13 5.13 6.27 10.26 9.39 15.4.31.51.68.76 1.29.75 1.29-.02 2.58.03 3.87.03 1.4 0 2.79.02 4.19-.02 1.06-.03 1.25-.42.71-1.29-.73-1.19-1.47-2.37-2.19-3.57-3.71-6.1-7.42-12.19-11.13-18.3-.31-.51-.69-.76-1.3-.75-1.4.03-2.79 0-4.19 0ZM68.58 61.72h4.19c.91 0 .98-.13.51-.9l-5.76-9.42c-3.45-5.66-6.9-11.32-10.36-16.98-.42-.69-.55-.7-.98-.01-1.47 2.37-2.92 4.76-4.38 7.14-.24.39-.22.74.03 1.12.41.63.79 1.28 1.18 1.92 3.31 5.43 6.63 10.86 9.93 16.31.35.58.8.82 1.44.82h4.19ZM31.14.03h-4.19c-.28 0-.65-.12-.81.19-.17.31.15.54.3.78 5.23 8.59 10.48 17.17 15.72 25.76.39.64.53.65.92.02 1.45-2.35 2.87-4.72 4.33-7.07.32-.51.29-.89-.03-1.39-1.24-1.97-2.45-3.97-3.66-5.96-2.28-3.73-4.57-7.45-6.8-11.21-.5-.85-1.09-1.2-2.07-1.14-1.23.08-2.47.02-3.7.02Z" />
  </>
);

export interface InvoiceItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface InvoiceFormData {
  bizName: string;
  bizTag: string;
  bizPhone: string;
  bizEmail: string;
  bizLocation: string;
  customLogoUrl: string | null;
  customWatermarkUrl: string | null;
  
  noInv: string;
  invDate: string;
  paymentType: 'dp' | 'full';
  dpPercent: number;
  clientName: string;
  clientAddress: string;
  
  items: InvoiceItem[];
  
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  customNote1: string;
  customNote2: string;
}

const DEFAULT_INVOICE_DATA: InvoiceFormData = {
  bizName: 'VirAshelle',
  bizTag: 'PRODUCTION HOUSE',
  bizPhone: '085173339084',
  bizEmail: 'naufaleko7271@gmail.com',
  bizLocation: 'Jakarta',
  customLogoUrl: null,
  customWatermarkUrl: null,
  
  noInv: '#0028',
  invDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
  paymentType: 'dp',
  dpPercent: 30,
  clientName: 'Stupa Studio',
  clientAddress: 'Cipete Sel, Kec. Cilandak, Jakarta Selatan',
  
  items: [
    { id: '1', name: 'Animasi 3D', qty: 1, price: 7000000 }
  ],
  
  bankName: 'BANK BCA',
  bankAccount: '7550429335',
  bankHolder: 'Naufal Eko Fahrizi',
  customNote1: '',
  customNote2: '',
};

const MAX_BRAND_IMAGE_BYTES = 1024 * 1024; // 1 MB

function formatRupiah(number: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number).replace('IDR', 'Rp');
}

export function InvoicePage() {
  const [data, setData] = useState<InvoiceFormData>(DEFAULT_INVOICE_DATA);
  const [activeTab, setActiveTab] = useState<'transaksi' | 'items' | 'branding' | 'pembayaran'>('transaksi');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  // Database persistence state
  const [dbId, setDbId] = useState<string | null>(null);
  const [dbBusy, setDbBusy] = useState(false);
  const [dbMessage, setDbMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'history'>('editor');
  const [historyBusyId, setHistoryBusyId] = useState<string | null>(null);

  // History search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'dp' | 'full'>('all');
  const [sortField, setSortField] = useState<'updated_at' | 'created_at' | 'no_inv' | 'client_name' | 'grand_total'>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { projects } = useProjects();
  const { invoices, loading: invoicesLoading, error: invoicesError, refresh: refreshInvoices, getInvoice, saveInvoice, deleteInvoice } = useInvoices();

  // Auto-clear "ok" feedback after ~3s
  useEffect(() => {
    if (!dbMessage || dbMessage.type !== 'ok') return;
    const t = setTimeout(() => setDbMessage(null), 3000);
    return () => clearTimeout(t);
  }, [dbMessage]);

  // History table statistics
  const invoiceStats = useMemo(() => {
    const totalCount = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.grand_total) || 0), 0);
    const fullCount = invoices.filter(inv => inv.payment_type === 'full').length;
    const dpCount = invoices.filter(inv => inv.payment_type === 'dp').length;
    return { totalCount, totalRevenue, fullCount, dpCount };
  }, [invoices]);

  const handleToggleSort = (field: 'updated_at' | 'created_at' | 'no_inv' | 'client_name' | 'grand_total') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'client_name' || field === 'no_inv' ? 'asc' : 'desc');
    }
  };

  const filteredInvoices = useMemo(() => {
    let list = [...invoices];

    if (paymentFilter !== 'all') {
      list = list.filter(inv => inv.payment_type === paymentFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(inv =>
        (inv.no_inv || '').toLowerCase().includes(q) ||
        (inv.client_name || '').toLowerCase().includes(q) ||
        formatRupiah(inv.grand_total).toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let result = 0;
      if (sortField === 'updated_at') {
        result = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        return sortDirection === 'desc' ? result : -result;
      } else if (sortField === 'created_at') {
        result = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sortDirection === 'desc' ? result : -result;
      } else if (sortField === 'grand_total') {
        result = (Number(b.grand_total) || 0) - (Number(a.grand_total) || 0);
        return sortDirection === 'desc' ? result : -result;
      } else if (sortField === 'no_inv') {
        result = (a.no_inv || '').localeCompare(b.no_inv || '', undefined, { numeric: true });
        return sortDirection === 'asc' ? result : -result;
      } else if (sortField === 'client_name') {
        result = (a.client_name || '').localeCompare(b.client_name || '');
        return sortDirection === 'asc' ? result : -result;
      }
      return 0;
    });

    return list;
  }, [invoices, paymentFilter, searchQuery, sortField, sortDirection]);

  // Financial calculations
  const { subtotal, dpAmount, grandTotal, remainingAmount } = useMemo(() => {
    const sub = data.items.reduce((acc, item) => acc + (item.qty * (item.price || 0)), 0);
    if (data.paymentType === 'dp') {
      const dp = Math.round((sub * (data.dpPercent || 0)) / 100);
      const rem = sub - dp;
      return {
        subtotal: sub,
        dpAmount: dp,
        grandTotal: dp,
        remainingAmount: rem,
      };
    } else {
      return {
        subtotal: sub,
        dpAmount: 0,
        grandTotal: sub,
        remainingAmount: 0,
      };
    }
  }, [data.items, data.paymentType, data.dpPercent]);

  // Form Field Updates
  const updateField = <K extends keyof InvoiceFormData>(key: K, value: InvoiceFormData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Item Management
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      qty: 1,
      price: 0
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return;
    setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const updateItem = (id: string, field: 'name' | 'qty' | 'price', value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'name' ? value : Number(value) || 0
          };
        }
        return item;
      })
    }));
  };

  // Auto-fill from Project
  const handleSelectProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    setData(prev => ({
      ...prev,
      clientName: proj.client || prev.clientName,
      items: [
        {
          id: Math.random().toString(36).substring(2, 9),
          name: `${proj.title} (${proj.category || 'Production'})`,
          qty: 1,
          price: proj.budget || 0
        }
      ]
    }));
  };

  // Handle Logo & Watermark Uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetKey: 'customLogoUrl' | 'customWatermarkUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Stored inline as base64 (and saved into the invoices row), so keep it small
    if (file.size > MAX_BRAND_IMAGE_BYTES) {
      alert('Ukuran gambar maksimal 1MB. Kecilkan dulu gambarnya (PNG/JPG/SVG).');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateField(targetKey, result);
    };
    reader.readAsDataURL(file);
  };

  // Save Project as JSON
  const handleSaveJson = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_VirAshelle_${data.noInv.replace('#', '')}_${data.clientName.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  // Load Project from JSON
  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string);
        setData({ ...DEFAULT_INVOICE_DATA, ...loadedData });
        // A JSON file is a separate document: detach from any DB row that was open
        setDbId(null);
        setDbMessage(null);
      } catch (err) {
        console.error('Failed to parse invoice JSON:', err);
        alert('File format tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  // Print PDF Function
  const handlePrint = () => {
    const originalTitle = document.title;
    const fileName = `Invoice_${data.noInv}_${data.clientName}`.replace(/\s+/g, '_');
    document.title = fileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  // Database persistence
  const getErrorMessage = (err: unknown): string => {
    const raw =
      typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string'
        ? (err as { message: string }).message
        : err instanceof Error
          ? err.message
          : String(err);
    if (/relation .*"?invoices"? does not exist/i.test(raw) || /invoices.*schema cache/i.test(raw)) {
      return `${raw}. Jalankan migration supabase/migrations/003_invoices.sql dulu.`;
    }
    return raw;
  };

  const handleSaveToDb = async () => {
    if (dbBusy) return;
    setDbBusy(true);
    setDbMessage(null);
    try {
      const row = await saveInvoice({
        id: dbId ?? undefined,
        no_inv: data.noInv,
        client_name: data.clientName,
        payment_type: data.paymentType,
        grand_total: grandTotal,
        data,
      });
      setDbId(row.id);
      setDbMessage({ type: 'ok', text: dbId ? 'Invoice diperbarui di database.' : 'Invoice tersimpan di database.' });
    } catch (err) {
      console.error('Failed to save invoice to database:', err);
      setDbMessage({ type: 'err', text: getErrorMessage(err) });
    } finally {
      setDbBusy(false);
    }
  };

  const handleOpenHistory = () => {
    setViewMode('history');
    refreshInvoices();
  };

  const handleLoadFromDb = async (id: string, autoPrint = false) => {
    if (historyBusyId) return;
    if (id !== dbId && hasUnsavedWork()) {
      const ok = window.confirm('Buka invoice ini? Perubahan yang belum disimpan ke database akan hilang.');
      if (!ok) return;
    }
    setHistoryBusyId(id);
    try {
      const row = await getInvoice(id);
      const loaded = (row.data && typeof row.data === 'object' ? row.data : {}) as Partial<InvoiceFormData>;
      // Merge over defaults so missing keys (older rows) are safe
      setData({ ...DEFAULT_INVOICE_DATA, ...loaded });
      setDbId(row.id);
      setDbMessage({ type: 'ok', text: `Invoice ${row.no_inv} dimuat dari database.` });
      setViewMode('editor');
      if (autoPrint) {
        setTimeout(() => {
          handlePrint();
        }, 300);
      }
    } catch (err) {
      console.error('Failed to load invoice from database:', err);
      setDbMessage({ type: 'err', text: getErrorMessage(err) });
    } finally {
      setHistoryBusyId(null);
    }
  };

  const handleDeleteFromDb = async (id: string, noInv: string) => {
    if (historyBusyId) return;
    if (!window.confirm(`Hapus invoice ${noInv} dari database? Tindakan ini tidak bisa dibatalkan.`)) return;
    setHistoryBusyId(id);
    try {
      await deleteInvoice(id);
      if (dbId === id) setDbId(null);
      setDbMessage({ type: 'ok', text: `Invoice ${noInv} dihapus dari database.` });
    } catch (err) {
      console.error('Failed to delete invoice from database:', err);
      setDbMessage({ type: 'err', text: getErrorMessage(err) });
    } finally {
      setHistoryBusyId(null);
    }
  };

  const hasUnsavedWork = () =>
    !!dbId || JSON.stringify(data.items) !== JSON.stringify(DEFAULT_INVOICE_DATA.items);

  const handleNewInvoice = () => {
    if (hasUnsavedWork()) {
      const ok = window.confirm('Mulai invoice baru? Perubahan yang belum disimpan ke database akan hilang.');
      if (!ok) return;
    }
    setData(DEFAULT_INVOICE_DATA);
    setDbId(null);
    setDbMessage(null);
    setActiveTab('transaksi');
    setViewMode('editor');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 no-print">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#4BD200]/15 text-[#4BD200] border border-[#4BD200]/40" aria-hidden="true">
              <Receipt size={22} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Invoice Generator</h1>
            {dbId && viewMode === 'editor' && (
              <span
                className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4BD200]/10 border border-[#4BD200]/30 text-[11px] font-ui font-semibold text-[#4BD200]"
                title={`ID: ${dbId}`}
              >
                <Check size={12} aria-hidden="true" />
                Tersimpan di database
              </span>
            )}
          </div>
          <p className="text-sm font-ui text-zinc-400 mt-1.5">
            {viewMode === 'editor'
              ? 'Buat, sesuaikan, dan cetak invoice resmi VirAshelle berstandar A4.'
              : 'Daftar riwayat invoice resmi yang tersimpan di database Supabase.'}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          {viewMode === 'editor' ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleLoadJson}
              />
              <button
                type="button"
                onClick={handleNewInvoice}
                className="px-3.5 py-2 bg-[#111118] hover:bg-[#111118] border border-white/10 hover:border-[#4BD200]/30 text-zinc-300 hover:text-white rounded-xl text-xs sm:text-sm font-ui font-medium transition-all flex items-center gap-2"
                title="Mulai invoice baru dari template default"
              >
                <FilePlus size={16} /> Invoice Baru
              </button>

              <button
                type="button"
                onClick={handleSaveToDb}
                disabled={dbBusy}
                className="px-3.5 py-2 bg-[#111118] border border-[#4BD200]/40 hover:bg-[#4BD200]/10 text-[#4BD200] rounded-xl text-xs sm:text-sm font-ui font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dbBusy ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                {dbBusy ? 'Menyimpan...' : dbId ? 'Update di Database' : 'Simpan ke Database'}
              </button>

              <span className="hidden sm:block w-px h-6 bg-white/10" aria-hidden="true" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-[#111118] hover:bg-[#111118] border border-white/10 hover:border-[#4BD200]/30 text-zinc-300 hover:text-white rounded-xl text-xs sm:text-sm font-ui font-medium transition-all flex items-center gap-2"
              >
                <FolderOpen size={16} /> Buka JSON
              </button>

              <button
                type="button"
                onClick={handleSaveJson}
                className="px-3.5 py-2 bg-[#111118] hover:bg-[#111118] border border-white/10 hover:border-[#4BD200]/30 text-zinc-300 hover:text-white rounded-xl text-xs sm:text-sm font-ui font-medium transition-all flex items-center gap-2"
              >
                {saveSuccess ? <Check size={16} className="text-[#4BD200]" /> : <Save size={16} />}
                {saveSuccess ? 'Tersimpan!' : 'Simpan JSON'}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <Download size={16} /> Cetak / Unduh PDF (A4)
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleNewInvoice}
                className="px-4 py-2 bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <FilePlus size={16} /> Buat Invoice Baru
              </button>
              <button
                type="button"
                onClick={() => refreshInvoices()}
                disabled={invoicesLoading}
                className="px-3.5 py-2 bg-[#111118] border border-white/10 hover:bg-[#111118] hover:border-[#4BD200]/30 text-zinc-300 hover:text-white rounded-xl text-xs sm:text-sm font-ui font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw size={16} className={invoicesLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          )}

          {dbMessage && (
            <p
              role="status"
              className={`text-xs font-ui flex items-center gap-1.5 max-w-xl text-left sm:text-right ${
                dbMessage.type === 'ok' ? 'text-[#4BD200]' : 'text-red-400'
              }`}
            >
              {dbMessage.type === 'ok' ? <Check size={13} /> : <X size={13} />}
              <span>{dbMessage.text}</span>
            </p>
          )}
        </div>
      </div>

      {/* Main View Tabs (Pembuat Invoice vs Riwayat Invoice) */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3.5 no-print">
        <button
          type="button"
          onClick={() => setViewMode('editor')}
          className={`px-4 py-2 text-xs sm:text-sm font-ui rounded-xl transition-all flex items-center gap-2 ${
            viewMode === 'editor'
              ? 'bg-[#4BD200] text-black font-bold'
              : 'bg-[#111118] text-zinc-400 hover:text-white border border-white/10 hover:border-[#4BD200]/30'
          }`}
        >
          <FileText size={16} /> Pembuat Invoice
        </button>

        <button
          type="button"
          onClick={handleOpenHistory}
          className={`px-4 py-2 text-xs sm:text-sm font-ui rounded-xl transition-all flex items-center gap-2 ${
            viewMode === 'history'
              ? 'bg-[#4BD200] text-black font-bold'
              : 'bg-[#111118] text-zinc-400 hover:text-white border border-white/10 hover:border-[#4BD200]/30'
          }`}
        >
          <History size={16} /> Riwayat Invoice
          {invoices.length > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                viewMode === 'history' ? 'bg-black/30 text-black' : 'bg-black/60 text-[#4BD200] border border-[#4BD200]/30'
              }`}
            >
              {invoices.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Dual Pane Layout (Editor Mode) */}
      {viewMode === 'editor' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Form Editor Panel (no-print) */}
        <div className="xl:col-span-5 space-y-6 no-print">
          {/* Editor Tabs */}
          <div className="flex bg-[#0a0a0f] p-1 rounded-xl border border-white/10 gap-1 font-ui">
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'transaksi' 
                  ? 'bg-[#4BD200] text-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText size={14} /> Transaksi
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'items' 
                  ? 'bg-[#4BD200] text-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Receipt size={14} /> Rincian Item ({data.items.length})
            </button>
            <button
              onClick={() => setActiveTab('pembayaran')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pembayaran' 
                  ? 'bg-[#4BD200] text-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CreditCard size={14} /> Bank & Catatan
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'branding' 
                  ? 'bg-[#4BD200] text-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 size={14} /> Branding
            </button>
          </div>

          {/* Tab 1: Transaksi & Client */}
          {activeTab === 'transaksi' && (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden group">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-[#4BD200]" /> Detail Transaksi
                </h3>
                {projects.length > 0 && (
                  <div className="flex items-center gap-2 max-w-full">
                    <FolderInput size={13} className="text-zinc-400 shrink-0" aria-hidden="true" />
                    <BrandedDropdown
                      size="sm"
                      ariaLabel="Import dari proyek"
                      className="w-44 sm:w-60"
                      value=""
                      onChange={handleSelectProject}
                      placeholder="Import dari Proyek"
                      emptyText="Belum ada proyek untuk diimpor"
                      options={projects.map((p) => ({ value: p.id, label: `${p.title} (${p.client})` }))}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">No. Invoice</label>
                  <input
                    type="text"
                    value={data.noInv}
                    onChange={(e) => updateField('noInv', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 outline-none transition-all"
                    placeholder="#0028"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Tanggal Invoice</label>
                  <input
                    type="text"
                    value={data.invDate}
                    onChange={(e) => updateField('invDate', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Tipe Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('paymentType', 'dp')}
                    className={`py-2 px-3 rounded-xl text-xs font-ui font-semibold border transition-all text-center ${
                      data.paymentType === 'dp'
                        ? 'bg-[#4BD200]/15 border-[#4BD200] text-[#4BD200]'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Down Payment (DP)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('paymentType', 'full')}
                    className={`py-2 px-3 rounded-xl text-xs font-ui font-semibold border transition-all text-center ${
                      data.paymentType === 'full'
                        ? 'bg-[#4BD200]/15 border-[#4BD200] text-[#4BD200]'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Lunas (Full Payment)
                  </button>
                </div>
              </div>

              {data.paymentType === 'dp' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5 font-ui">
                    <label className="text-xs font-semibold text-zinc-400">Persentase DP</label>
                    <span className="text-xs font-bold font-mono text-[#4BD200]">{data.dpPercent}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={data.dpPercent}
                      onChange={(e) => updateField('dpPercent', parseInt(e.target.value))}
                      className="flex-1 accent-[#4BD200] cursor-pointer"
                    />
                    <input
                      type="number"
                      value={data.dpPercent}
                      onChange={(e) => updateField('dpPercent', parseInt(e.target.value) || 0)}
                      className="w-16 bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-center text-sm font-mono text-white outline-none focus:border-[#4BD200]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-white/[0.08] space-y-4">
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Nama Klien / Perusahaan</label>
                  <input
                    type="text"
                    value={data.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 outline-none transition-all"
                    placeholder="Contoh: Stupa Studio"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Alamat Klien</label>
                  <textarea
                    rows={2}
                    value={data.clientAddress}
                    onChange={(e) => updateField('clientAddress', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 outline-none resize-none transition-all"
                    placeholder="Alamat lengkap klien..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Item Pekerjaan Dinamis */}
          {activeTab === 'items' && (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden group">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                    <Receipt size={16} className="text-[#4BD200]" /> Daftar Item Pekerjaan
                  </h3>
                  <p className="text-xs font-ui text-dim">Rincian jasa/produk yang ditagihkan</p>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} /> Tambah Item
                </button>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                {data.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 bg-black/50 rounded-xl border border-white/10 space-y-3 relative group/item hover:border-[#4BD200]/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-dim">
                        Item #{index + 1}
                      </span>
                      {data.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-dim hover:text-red-400 p-1 rounded transition-colors"
                          title="Hapus baris item"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-ui font-semibold text-zinc-400 mb-1">Deskripsi Pekerjaan / Produk</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#4BD200] outline-none transition-all"
                        placeholder="Contoh: Produksi Video Animasi 3D"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-ui font-semibold text-zinc-400 mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#4BD200] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-ui font-semibold text-zinc-400 mb-1">Harga Satuan (Rp)</label>
                        <input
                          type="number"
                          step="100000"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#4BD200] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="text-right text-xs text-zinc-400 border-t border-white/[0.08] pt-2 font-ui">
                      Total: <span className="font-mono font-bold text-white">{formatRupiah(item.qty * item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Mini Summary */}
              <div className="p-3.5 bg-black/60 rounded-xl border border-white/10 space-y-2 text-xs font-ui">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-white">{formatRupiah(subtotal)}</span>
                </div>
                {data.paymentType === 'dp' && (
                  <div className="flex justify-between text-[#4BD200]">
                    <span>Tagihan DP ({data.dpPercent}%):</span>
                    <span className="font-mono font-bold">{formatRupiah(dpAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Pembayaran & Catatan */}
          {activeTab === 'pembayaran' && (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden group">
              <div className="border-b border-white/[0.08] pb-4">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-[#4BD200]" /> Info Rekening & Keterangan
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Nama Bank</label>
                  <input
                    type="text"
                    value={data.bankName}
                    onChange={(e) => updateField('bankName', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#4BD200] outline-none transition-all"
                    placeholder="BANK BCA"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Nomor Rekening</label>
                  <input
                    type="text"
                    value={data.bankAccount}
                    onChange={(e) => updateField('bankAccount', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#4BD200] outline-none transition-all"
                    placeholder="7550429335"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Atas Nama (Pemilik)</label>
                  <input
                    type="text"
                    value={data.bankHolder}
                    onChange={(e) => updateField('bankHolder', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#4BD200] outline-none transition-all"
                    placeholder="Naufal Eko Fahrizi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Catatan Khusus Tambahan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={data.customNote1}
                    onChange={(e) => updateField('customNote1', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#4BD200] outline-none resize-none transition-all"
                    placeholder="Bisa tambahkan instruksi konfirmasi WhatsApp dll..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Branding Studio */}
          {activeTab === 'branding' && (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden group">
              <div className="border-b border-white/[0.08] pb-4">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <Building2 size={16} className="text-[#4BD200]" /> Branding & Profil Studio
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Logo Kustom</label>
                    <input 
                      type="file" 
                      ref={logoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'customLogoUrl')}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-black/50 hover:bg-[#111118] border border-white/10 hover:border-[#4BD200]/30 rounded-xl text-xs font-ui text-zinc-300 flex items-center justify-center gap-2 transition-all"
                    >
                      <Upload size={14} /> {data.customLogoUrl ? 'Ganti Logo' : 'Upload PNG/SVG'}
                    </button>
                    {data.customLogoUrl && (
                      <button 
                        type="button"
                        onClick={() => updateField('customLogoUrl', null)}
                        className="text-[10px] text-red-400 hover:underline mt-1.5 block text-center w-full font-ui"
                      >
                        Reset ke Logo Bawaan
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Watermark Kustom</label>
                    <input 
                      type="file" 
                      ref={watermarkInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'customWatermarkUrl')}
                    />
                    <button
                      type="button"
                      onClick={() => watermarkInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-black/50 hover:bg-[#111118] border border-white/10 hover:border-[#4BD200]/30 rounded-xl text-xs font-ui text-zinc-300 flex items-center justify-center gap-2 transition-all"
                    >
                      <Upload size={14} /> {data.customWatermarkUrl ? 'Ganti Watermark' : 'Upload PNG/SVG'}
                    </button>
                    {data.customWatermarkUrl && (
                      <button 
                        type="button"
                        onClick={() => updateField('customWatermarkUrl', null)}
                        className="text-[10px] text-red-400 hover:underline mt-1.5 block text-center w-full font-ui"
                      >
                        Reset ke Watermark Bawaan
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Nama Bisnis</label>
                    <input
                      type="text"
                      value={data.bizName}
                      onChange={(e) => updateField('bizName', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#4BD200] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Tagline</label>
                    <input
                      type="text"
                      value={data.bizTag}
                      onChange={(e) => updateField('bizTag', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#4BD200] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">No. WhatsApp / HP</label>
                    <input
                      type="text"
                      value={data.bizPhone}
                      onChange={(e) => updateField('bizPhone', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:border-[#4BD200] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5">Email Bisnis</label>
                    <input
                      type="email"
                      value={data.bizEmail}
                      onChange={(e) => updateField('bizEmail', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#4BD200] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Preview Canvas */}
        <div className="xl:col-span-7 flex flex-col items-center">
          {/* Zoom & Canvas Toolbar (no-print) */}
          <div className="w-full flex items-center justify-between bg-[#111118] px-4 py-2.5 rounded-t-2xl border border-white/10 no-print">
            <div className="flex items-center gap-2 font-ui">
              <span className="text-xs text-zinc-300 font-semibold">A4 Live Print Preview</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/50 text-[#4BD200] border border-[#4BD200]/20 font-mono">
                210 × 297 mm
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-black/50 border border-white/10 hover:border-[#4BD200]/30 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-mono text-zinc-300 w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.2, prev + 0.1))}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-black/50 border border-white/10 hover:border-[#4BD200]/30 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                type="button"
                onClick={() => setZoomLevel(0.85)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-black/50 border border-white/10 hover:border-[#4BD200]/30 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Canvas Viewport (Scrollable with zoom scaling) */}
          <div className="w-full bg-[#0a0a0f] border-x border-b border-white/10 rounded-b-2xl p-4 sm:p-6 flex justify-center overflow-x-auto min-h-[750px] shadow-2xl">
            <div 
              style={{ 
                transform: `scale(${zoomLevel})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="transition-transform duration-100"
            >
              {/* PRINTABLE A4 INVOICE CONTAINER */}
              <div 
                id="invoice-card"
                className="bg-white text-zinc-900 shadow-2xl relative select-none"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm',
                  boxSizing: 'border-box',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* Watermark Background */}
                <div 
                  id="watermark-container"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                  style={{ opacity: 0.05, transform: 'rotate(-25deg) scale(0.95)' }}
                >
                  {data.customWatermarkUrl ? (
                    <img 
                      src={data.customWatermarkUrl} 
                      alt="Watermark" 
                      className="w-4/5 max-h-[500px] object-contain"
                    />
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 118.6 61.76" 
                      className="w-4/5 text-black fill-current"
                    >
                      {VIRASHELLE_SVG_PATH}
                    </svg>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 flex flex-col justify-between" style={{ minHeight: '257mm' }}>
                  <div>
                    {/* Header Branding */}
                    <div className="flex flex-col items-start mb-8">
                      <div className="bg-black w-20 h-20 flex items-center justify-center mb-3.5 p-2 rounded shadow-sm">
                        {data.customLogoUrl ? (
                          <img 
                            src={data.customLogoUrl} 
                            alt="Logo" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 118.6 61.76" 
                            className="w-full h-full fill-white"
                          >
                            {VIRASHELLE_SVG_PATH}
                          </svg>
                        )}
                      </div>
                      
                      <h1 className="text-3xl font-black text-black tracking-tight uppercase leading-none">
                        {data.bizName}
                      </h1>
                      <p className="text-xs font-semibold tracking-[0.25em] text-zinc-500 mt-1 uppercase">
                        {data.bizTag}
                      </p>
                      
                      <div className="mt-4 text-[9.5pt] text-zinc-600 space-y-0.5 leading-relaxed font-normal">
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-zinc-700">Telepon:</span> {data.bizPhone}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-zinc-700">Email:</span> {data.bizEmail}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-zinc-700">Lokasi:</span> {data.bizLocation}
                        </p>
                      </div>
                    </div>

                    {/* Invoice Meta Bar */}
                    <div className="mb-8 pt-4 border-t-2 border-zinc-900">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9pt] font-bold text-zinc-400 uppercase tracking-wider">
                            Ditagihkan Kepada:
                          </p>
                          <p className="font-bold text-zinc-900 text-lg mt-0.5">
                            {data.clientName || 'Nama Klien'}
                          </p>
                          <p className="text-[9.5pt] text-zinc-600 leading-snug mt-1 max-w-sm whitespace-pre-line">
                            {data.clientAddress || 'Alamat Klien'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <h2 className="text-3xl font-light text-zinc-300 uppercase tracking-widest leading-none mb-2">
                            INVOICE
                          </h2>
                          <div className="space-y-0.5 text-right">
                            <p className="text-[9.5pt]">
                              <span className="text-zinc-400 font-medium">No:</span>{' '}
                              <span className="font-bold text-zinc-900">{data.noInv}</span>
                            </p>
                            <p className="text-[9.5pt]">
                              <span className="text-zinc-400 font-medium">Tanggal:</span>{' '}
                              <span className="font-medium text-zinc-800">{data.invDate}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table of Items */}
                    <table className="w-full mb-8 border-collapse">
                      <thead>
                        <tr className="border-b-2 border-zinc-900">
                          <th className="text-left py-2.5 text-[9pt] font-bold text-zinc-600 uppercase tracking-wider w-[55%]">
                            Deskripsi Produk / Jasa
                          </th>
                          <th className="text-center py-2.5 text-[9pt] font-bold text-zinc-600 uppercase tracking-wider w-[15%]">
                            Qty
                          </th>
                          <th className="text-right py-2.5 text-[9pt] font-bold text-zinc-600 uppercase tracking-wider w-[15%]">
                            Harga Satuan
                          </th>
                          <th className="text-right py-2.5 text-[9pt] font-bold text-zinc-600 uppercase tracking-wider w-[15%]">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-zinc-100">
                            <td className="py-3 font-semibold text-zinc-800 text-[10pt]">
                              {item.name || '-'}
                            </td>
                            <td className="py-3 text-center text-zinc-700 text-[10pt]">
                              {item.qty}
                            </td>
                            <td className="py-3 text-right text-zinc-700 text-[10pt]">
                              {formatRupiah(item.price)}
                            </td>
                            <td className="py-3 text-right font-bold text-zinc-900 text-[10pt]">
                              {formatRupiah(item.qty * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals & Calculations Box */}
                    <div className="flex justify-end mb-8">
                      <div className="w-[50%] space-y-2">
                        <div className="flex justify-between items-center text-[10pt]">
                          <span className="text-zinc-500 font-medium">Sub-total</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(subtotal)}</span>
                        </div>
                        
                        {data.paymentType === 'dp' && (
                          <div className="flex justify-between items-center text-[10pt]">
                            <span className="text-zinc-500 font-medium">Down Payment (DP {data.dpPercent}%)</span>
                            <span className="font-semibold text-zinc-800">{formatRupiah(dpAmount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center bg-zinc-100 p-3 rounded-md mt-2 border border-zinc-200">
                          <span className="text-[9pt] font-black text-zinc-900 uppercase tracking-wide">
                            {data.paymentType === 'dp' ? 'Tagihan Down Payment' : 'Total Pembayaran (Lunas)'}
                          </span>
                          <span className="text-lg font-black text-zinc-950">
                            {formatRupiah(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes & Terms Box */}
                    <div className="mb-6 text-[9pt] text-zinc-600 leading-relaxed border-l-3 border-zinc-900 pl-4 bg-zinc-50 p-3.5 rounded-r">
                      <p className="font-bold text-zinc-900 mb-1">Keterangan:</p>
                      <ul className="space-y-1">
                        {data.paymentType === 'dp' ? (
                          <>
                            <li>• Invoice ini berlaku sebagai pengajuan pembayaran uang muka (DP) sebesar {data.dpPercent}% untuk pengerjaan.</li>
                            <li>• Sisa pembayaran sebesar {100 - (data.dpPercent || 0)}% ({formatRupiah(remainingAmount)}) akan ditagihkan setelah proyek selesai.</li>
                          </>
                        ) : (
                          <li>• Invoice ini merupakan pengajuan pembayaran penuh (Full Payment) untuk pengerjaan proyek.</li>
                        )}
                        {data.customNote1 && <li>• {data.customNote1}</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Footer: Bank Info & Signature */}
                  <div className="grid grid-cols-2 gap-6 items-end pt-4 border-t border-zinc-100">
                    <div>
                      <p className="text-[9pt] font-bold text-zinc-900 mb-1.5">Informasi Rekening Pembayaran</p>
                      <div className="bg-zinc-50 p-3 rounded-md border border-zinc-200 text-[9pt] leading-relaxed">
                        <p className="font-black text-zinc-950 tracking-wide">{data.bankName}</p>
                        <p className="text-zinc-800">
                          No. Rekening: <span className="font-bold tracking-wider">{data.bankAccount}</span>
                        </p>
                        <p className="text-zinc-600 italic">Atas nama: {data.bankHolder}</p>
                      </div>
                    </div>

                    <div className="text-center pb-1">
                      <p className="text-[9pt] text-zinc-500 mb-14">Hormat kami,</p>
                      <p className="font-bold text-zinc-900 underline uppercase tracking-tight text-[10pt]">
                        {data.bizName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* History Table List View Mode */}
      {viewMode === 'history' && (
        <div className="space-y-6 no-print">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-[#4BD200]/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-ui font-semibold">Total Invoice</span>
                <span className="p-2 rounded-xl bg-white/5 text-zinc-300 border border-white/10" aria-hidden="true">
                  <Receipt size={16} />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {invoiceStats.totalCount}
              </div>
              <p className="text-xs font-ui text-dim mt-1">Tersimpan di Supabase</p>
            </div>

            <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-[#4BD200]/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-ui font-semibold">Nilai Transaksi</span>
                <span className="p-2 rounded-xl bg-[#4BD200]/10 text-[#4BD200] border border-[#4BD200]/30" aria-hidden="true">
                  <CreditCard size={16} />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-[#4BD200] tracking-tight">
                {formatRupiah(invoiceStats.totalRevenue)}
              </div>
              <p className="text-xs font-ui text-dim mt-1">Akumulasi tagihan</p>
            </div>

            <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-[#4BD200]/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-ui font-semibold">Invoice Lunas</span>
                <span className="p-2 rounded-xl bg-white/5 text-zinc-300 border border-white/10" aria-hidden="true">
                  <Check size={16} />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {invoiceStats.fullCount}
              </div>
              <p className="text-xs font-ui text-dim mt-1">Pembayaran penuh (Full)</p>
            </div>

            <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 lg:p-5 relative overflow-hidden group hover:border-[#4BD200]/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-ui font-semibold">Uang Muka (DP)</span>
                <span className="p-2 rounded-xl bg-white/5 text-zinc-300 border border-white/10" aria-hidden="true">
                  <Percent size={16} />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {invoiceStats.dpCount}
              </div>
              <p className="text-xs font-ui text-dim mt-1">Pembayaran bertahap</p>
            </div>
          </div>

          {/* Search, Filter & Sort Toolbar */}
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Invoice (#0028), nama klien, atau nominal..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 transition-colors placeholder:text-dim"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-white p-0.5"
                  title="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Middle: Payment Filter Pills */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 shrink-0 font-ui">
              <button
                type="button"
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  paymentFilter === 'all'
                    ? 'bg-[#4BD200] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Semua ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('full')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  paymentFilter === 'full'
                    ? 'bg-[#4BD200] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Lunas ({invoiceStats.fullCount})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter('dp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  paymentFilter === 'dp'
                    ? 'bg-[#4BD200] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                DP ({invoiceStats.dpCount})
              </button>
            </div>

            {/* Right: Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 font-ui">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5 whitespace-nowrap">
                <ArrowUpDown size={14} className="text-[#4BD200]" /> Urutkan:
              </span>
              <BrandedDropdown
                size="sm"
                ariaLabel="Urutkan invoice"
                className="w-56"
                value={`${sortField}_${sortDirection}`}
                onChange={(val) => {
                  const idx = val.lastIndexOf('_');
                  setSortField(val.slice(0, idx) as typeof sortField);
                  setSortDirection(val.slice(idx + 1) as 'asc' | 'desc');
                }}
                options={[
                  { value: 'updated_at_desc', label: 'Terakhir Diperbarui (Terbaru)' },
                  { value: 'updated_at_asc', label: 'Terakhir Diperbarui (Terlama)' },
                  { value: 'created_at_desc', label: 'Tanggal Dibuat (Terbaru)' },
                  { value: 'created_at_asc', label: 'Tanggal Dibuat (Terlama)' },
                  { value: 'no_inv_asc', label: 'No. Invoice (A - Z)' },
                  { value: 'no_inv_desc', label: 'No. Invoice (Z - A)' },
                  { value: 'client_name_asc', label: 'Nama Klien (A - Z)' },
                  { value: 'client_name_desc', label: 'Nama Klien (Z - A)' },
                  { value: 'grand_total_desc', label: 'Total Tagihan (Tertinggi)' },
                  { value: 'grand_total_asc', label: 'Total Tagihan (Terendah)' },
                ]}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
            {invoicesLoading && invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-dim gap-3">
                <Loader2 size={24} className="animate-spin text-[#4BD200]" />
                <span className="text-sm font-ui">Memuat data riwayat invoice dari database...</span>
              </div>
            ) : invoicesError && invoices.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
                  <Database size={24} />
                </div>
                <p className="text-sm font-semibold text-red-400 font-ui">Gagal Memuat Riwayat Invoice</p>
                <p className="text-xs text-dim max-w-md break-words">{invoicesError}</p>
                <button
                  type="button"
                  onClick={() => refreshInvoices()}
                  className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-ui font-medium transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center gap-3">
                <div className="p-4 bg-black/50 text-dim border border-white/10 rounded-2xl">
                  <Receipt size={32} />
                </div>
                <p className="text-base font-display font-bold text-white">Belum Ada Riwayat Invoice Tersimpan</p>
                <p className="text-xs font-ui text-zinc-400 max-w-sm">
                  Invoice yang Anda buat dan simpan ke database akan otomatis tercatat rapi di sini.
                </p>
                <button
                  type="button"
                  onClick={handleNewInvoice}
                  className="mt-3 px-4 py-2 bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <FilePlus size={14} /> Buat Invoice Sekarang
                </button>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center gap-3">
                <div className="p-4 bg-black/50 text-dim border border-white/10 rounded-2xl">
                  <Search size={32} />
                </div>
                <p className="text-base font-display font-bold text-white">Tidak Ada Invoice yang Cocok</p>
                <p className="text-xs font-ui text-zinc-400 max-w-sm">
                  Tidak ditemukan invoice yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau filter yang dipilih.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setPaymentFilter('all');
                  }}
                  className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-ui font-medium transition-colors"
                >
                  Reset Filter & Pencarian
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0a0a0f] text-xs font-ui font-semibold text-zinc-400">
                      <th
                        onClick={() => handleToggleSort('no_inv')}
                        className="py-3.5 px-6 cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          No. Invoice
                          {sortField === 'no_inv' && (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-[#4BD200]" /> : <ArrowDown size={13} className="text-[#4BD200]" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleToggleSort('client_name')}
                        className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          Klien
                          {sortField === 'client_name' && (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-[#4BD200]" /> : <ArrowDown size={13} className="text-[#4BD200]" />
                          )}
                        </div>
                      </th>
                      <th className="py-3.5 px-4">Tipe Bayar</th>
                      <th
                        onClick={() => handleToggleSort('grand_total')}
                        className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Total Tagihan
                          {sortField === 'grand_total' && (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-[#4BD200]" /> : <ArrowDown size={13} className="text-[#4BD200]" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleToggleSort('updated_at')}
                        className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none hidden md:table-cell"
                      >
                        <div className="flex items-center gap-1.5">
                          Terakhir Diperbarui
                          {sortField === 'updated_at' && (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-[#4BD200]" /> : <ArrowDown size={13} className="text-[#4BD200]" />
                          )}
                        </div>
                      </th>
                      <th className="py-3.5 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInvoices.map((inv) => {
                      const isCurrent = inv.id === dbId;
                      const isBusy = historyBusyId === inv.id;
                      return (
                        <tr
                          key={inv.id}
                          className={`group transition-colors ${
                            isCurrent
                              ? 'bg-[#4BD200]/10 hover:bg-[#4BD200]/15'
                              : 'hover:bg-[#4BD200]/[0.03]'
                          }`}
                        >
                          <td className="py-4 px-6 font-mono text-white">
                            <div className="flex items-center gap-2">
                              {isCurrent ? (
                                <span className="inline-flex rounded-full h-2 w-2 bg-[#4BD200]" title="Aktif di editor" aria-label="Aktif di editor" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" aria-hidden="true" />
                              )}
                              <span className="font-bold text-sm">{inv.no_inv || '-'}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4BD200]/20 text-[#4BD200] font-ui font-semibold">
                                  Aktif
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-zinc-300 font-ui">
                            <div className="font-medium text-white max-w-[220px] truncate" title={inv.client_name}>
                              {inv.client_name || '-'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-ui font-semibold border ${
                                inv.payment_type === 'full'
                                  ? 'bg-[#4BD200]/10 text-[#4BD200] border-[#4BD200]/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {inv.payment_type === 'full' ? 'Lunas' : 'DP / Bertahap'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                            <span className={inv.payment_type === 'full' ? 'text-[#4BD200]' : 'text-zinc-200'}>
                              {formatRupiah(inv.grand_total)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-mono text-zinc-400 whitespace-nowrap hidden md:table-cell">
                            {new Date(inv.updated_at).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleLoadFromDb(inv.id, false)}
                                disabled={isBusy}
                                className="px-3 py-1.5 bg-[#4BD200]/15 hover:bg-[#4BD200]/25 text-[#4BD200] border border-[#4BD200]/40 rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
                                title="Muat invoice ke editor"
                              >
                                {isBusy ? <Loader2 size={13} className="animate-spin" /> : <FolderOpen size={13} />}
                                Buka
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadFromDb(inv.id, true)}
                                disabled={isBusy}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 hover:border-white/20 rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                                title="Muat dan cetak langsung"
                              >
                                <Download size={13} />
                                Cetak
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFromDb(inv.id, inv.no_inv)}
                                disabled={isBusy}
                                className="p-1.5 text-dim hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-40"
                                title="Hapus invoice dari database"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="p-4 border-t border-white/10 bg-[#0a0a0f]/80 flex items-center justify-between text-xs font-ui text-dim">
                  <span>Menampilkan {filteredInvoices.length} dari {invoices.length} invoice</span>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[#4BD200] hover:underline"
                    >
                      Hapus filter pencarian
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
