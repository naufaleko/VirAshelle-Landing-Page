import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Tag, Building, FileText, Link2, Loader2, AlertCircle } from 'lucide-react';
import { TransactionType, FinancialTransaction } from '../types';
import { CATEGORY_LABELS } from '../hooks/useFinance';
import { useEscapeKey } from '../lib/useEscapeKey';
import { useModalPresence } from '../lib/usePresence';
import { BrandedDropdown } from './BrandedDropdown';
import { BrandedDatePicker } from './BrandedDatePicker';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  userEmail: string;
}

const INCOME_CATEGORIES = [
  'client_invoice',
  'down_payment',
  'final_payment',
  'retainer',
  'capital_injection',
  'other_income',
];

const EXPENSE_CATEGORIES = [
  'project_production',
  'software_licenses',
  'equipment_rental',
  'marketing_ads',
  'office_operations',
  'salaries_honorarium',
  'sppd_travel',
  'petty_cash',
  'tax_legal',
  'other_expense',
];

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Terkonfirmasi' },
  { value: 'pending', label: 'Tertunda' },
];

const ACCOUNT_OPTIONS = [
  'BCA - VirAshelle Master',
  'Mandiri - Operational',
  'Kas Kecil Studio',
  'Payment Gateway / Midtrans',
];

export function TransactionModal({ isOpen, onClose, onSubmit, userEmail }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('income');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [category, setCategory] = useState<string>('client_invoice');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [account, setAccount] = useState<string>('BCA - VirAshelle Master');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [status, setStatus] = useState<'confirmed' | 'pending'>('confirmed');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEscapeKey(isOpen && !submitting, onClose);
  const { mounted, overlayRef, panelRef } = useModalPresence(isOpen);

  // Format display amount with thousands separators
  const formatDisplayAmount = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('id-ID');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    setAmountRaw(cleaned);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('client_invoice');
    } else {
      setCategory('project_production');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numericAmount = Number(amountRaw);
    if (!numericAmount || numericAmount <= 0) {
      setFormError('Nominal transaksi harus lebih dari 0.');
      return;
    }
    if (!date) {
      setFormError('Tanggal transaksi wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setFormError('Deskripsi / keterangan transaksi wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        transaction_date: date,
        type,
        category,
        amount: numericAmount,
        account,
        reference_no: referenceNo.trim() || null,
        description: description.trim(),
        attachment_url: attachmentUrl.trim() || null,
        status,
        created_by: userEmail,
      });

      // Reset form
      setAmountRaw('');
      setDescription('');
      setReferenceNo('');
      setAttachmentUrl('');
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryOptions = currentCategories.map((cat) => ({ value: cat, label: CATEGORY_LABELS[cat] || cat }));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-heading"
    >
        <div
          ref={panelRef as React.RefObject<HTMLDivElement>}
          className="relative w-full max-w-xl bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden my-8 shadow-[0_24px_64px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#111118]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                type === 'income' ? 'bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <h2 id="tx-modal-heading" className="text-lg font-display font-bold text-white tracking-tight">Catat Transaksi</h2>
                <p className="text-xs font-body text-zinc-400 mt-0.5">Kas masuk atau keluar studio</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 font-ui">
            {formError && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-medium" role="alert">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Type Switcher */}
            <div>
              <label className="block text-xs font-ui font-semibold text-zinc-400 mb-2">
                Jenis
              </label>
              <div className="grid grid-cols-2 gap-2.5 p-1 bg-[#000000]/60 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  aria-pressed={type === 'income'}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-ui font-bold transition-colors ${
                    type === 'income'
                      ? 'bg-[#4BD200] hover:bg-[#7cff33] text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TrendingUp size={15} aria-hidden="true" />
                  Uang masuk
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  aria-pressed={type === 'expense'}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-ui font-bold transition-colors ${
                    type === 'expense'
                      ? 'bg-[#ff3344] hover:bg-[#ff4d60] text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TrendingDown size={15} aria-hidden="true" />
                  Uang keluar
                </button>
              </div>
            </div>

            {/* Nominal Amount */}
            <div>
              <label className="block text-xs font-ui font-semibold text-zinc-400 mb-2">
                Nominal (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-display font-bold text-base" aria-hidden="true">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Nominal dalam rupiah"
                  required
                  placeholder="0"
                  value={formatDisplayAmount(amountRaw)}
                  onChange={handleAmountChange}
                  className="w-full bg-[#000000]/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-lg font-mono font-bold focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200] transition-colors"
                />
              </div>
            </div>

            {/* Date & Account Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tx-date" className="block text-xs font-ui font-semibold text-zinc-400 mb-2">
                  Tanggal
                </label>
                <BrandedDatePicker id="tx-date" value={date} onChange={setDate} />
              </div>
              <div>
                <label htmlFor="tx-account" className="block text-xs font-ui font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Building size={13} aria-hidden="true" /> Rekening
                </label>
                <BrandedDropdown id="tx-account" value={account} onChange={setAccount} options={ACCOUNT_OPTIONS} />
              </div>
            </div>

            {/* Category & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tx-category" className="block text-xs font-ui font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Tag size={13} aria-hidden="true" /> Kategori
                </label>
                <BrandedDropdown id="tx-category" value={category} onChange={setCategory} options={categoryOptions} />
              </div>
              <div>
                <label htmlFor="tx-status" className="block text-xs font-ui font-semibold text-zinc-400 mb-2">
                  Status
                </label>
                <BrandedDropdown
                  id="tx-status"
                  value={status}
                  onChange={(v) => setStatus(v as 'confirmed' | 'pending')}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            {/* Reference No */}
            <div>
              <label className="block text-xs font-ui font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                <FileText size={13} aria-hidden="true" /> No. referensi / invoice (opsional)
              </label>
              <input
                type="text"
                placeholder="cth: INV/2026/099 atau PO/2026/045"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-[#000000]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-ui placeholder:text-dim focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-ui font-semibold text-zinc-400 mb-2">
                Keterangan transaksi
              </label>
              <textarea
                required
                rows={2}
                placeholder="cth: Pembayaran Pelunasan Brand Identity Telin atau Sewa GPU Render Farm Octane"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#000000]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-ui placeholder:text-dim focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200] transition-colors resize-none"
              />
            </div>

            {/* Attachment Proof URL */}
            <div>
              <label className="block text-xs font-ui font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                <Link2 size={13} aria-hidden="true" /> Tautan bukti nota / transfer (opsional)
              </label>
              <input
                type="url"
                placeholder="https://... (link gambar nota, invoice PDF, atau bukti transfer)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full bg-[#000000]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-ui placeholder:text-dim focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200] transition-colors"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-ui font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-ui font-bold flex items-center gap-2 transition-colors ${
                  type === 'income'
                    ? 'bg-[#4BD200] hover:bg-[#7cff33] text-black'
                    : 'bg-[#ff3344] hover:bg-[#ff4d60] text-black'
                } disabled:opacity-50`}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Transaksi'
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
