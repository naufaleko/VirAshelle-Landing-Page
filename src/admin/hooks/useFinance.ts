import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  FinancialTransaction, 
  FinancialSummary, 
  MonthlyCashflowPoint, 
  CategoryBreakdown,
} from '../types';

// Two semantic colors only: money in is the brand green, money out is the expense red.
// Category breakdowns are drawn as ranked bars, so length (not hue) tells categories apart.
const INCOME_COLOR = '#4BD200';
const EXPENSE_COLOR = '#ff3344';
const CATEGORY_COLORS: Record<string, string> = {
  client_invoice: INCOME_COLOR,
  down_payment: INCOME_COLOR,
  final_payment: INCOME_COLOR,
  retainer: INCOME_COLOR,
  capital_injection: INCOME_COLOR,
  other_income: INCOME_COLOR,
  project_production: EXPENSE_COLOR,
  software_licenses: EXPENSE_COLOR,
  equipment_rental: EXPENSE_COLOR,
  marketing_ads: EXPENSE_COLOR,
  office_operations: EXPENSE_COLOR,
  salaries_honorarium: EXPENSE_COLOR,
  sppd_travel: EXPENSE_COLOR,
  petty_cash: EXPENSE_COLOR,
  tax_legal: EXPENSE_COLOR,
  other_expense: EXPENSE_COLOR,
};

export const CATEGORY_LABELS: Record<string, string> = {
  client_invoice: 'Pelunasan Invoice Klien',
  down_payment: 'DP / Uang Muka Proyek',
  final_payment: 'Pembayaran Termin Akhir',
  retainer: 'Retainer Bulanan Klien',
  capital_injection: 'Suntikan Modal / Top-up',
  other_income: 'Pemasukan Lainnya',
  project_production: 'Biaya Produksi Proyek',
  software_licenses: 'Lisensi Software & Tools',
  equipment_rental: 'Sewa Alat & Studio',
  marketing_ads: 'Iklan & Pemasaran B2B',
  office_operations: 'Operasional & Hosting Studio',
  salaries_honorarium: 'Gaji & Honorarium Freelance',
  sppd_travel: 'Biaya Perjalanan / SPPD',
  petty_cash: 'Kas Kecil / Petty Cash',
  tax_legal: 'Pajak & Legalitas Perusahaan',
  other_expense: 'Pengeluaran Lainnya',
};

export function formatRupiah(amount: number): string {
  if (amount === undefined || amount === null) return 'Rp 0';
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

export function formatRpCompact(amount: number): string {
  if (!amount) return 'Rp 0';
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function useFinance() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [pendingReceivables, setPendingReceivables] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // True only while the postgres_changes channel reports SUBSCRIBED; the UI shows this as the realtime indicator.
  const [live, setLive] = useState(false);

  // Load transactions and pending receivables
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (txError) throw txError;
      setTransactions((txData as FinancialTransaction[]) || []);

      // 2. Fetch pending invoices for receivables calculation
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select('grand_total, payment_type');

      if (!invError && invData) {
        // Assume DP invoices have remaining balance or pending payments
        const totalReceivables = invData
          .filter(inv => inv.payment_type === 'dp')
          .reduce((sum, inv) => sum + (Number(inv.grand_total) || 0), 0);
        setPendingReceivables(totalReceivables);
      }
    } catch (err: any) {
      console.error('Error fetching financial data:', err);
      setError(err.message || 'Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('financial_transactions_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financial_transactions' },
        () => {
          fetchData();
        }
      )
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED');
      });

    return () => {
      setLive(false);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Aggregate financial metrics
  const summary: FinancialSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        const cat = tx.category || 'other_expense';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      }
    });

    const netBalance = totalIncome - totalExpense;

    // Build 6-month monthly cashflow data
    const now = new Date();
    const monthlyMap = new Map<string, MonthlyCashflowPoint>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short' });
      const fullLabel = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      monthlyMap.set(key, { month: key, label, fullLabel, income: 0, expense: 0, net: 0 });
    }

    transactions.forEach((tx) => {
      if (!tx.transaction_date) return;
      const key = tx.transaction_date.slice(0, 7);
      const pt = monthlyMap.get(key);
      if (pt) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') {
          pt.income += amt;
        } else {
          pt.expense += amt;
        }
        pt.net = pt.income - pt.expense;
      }
    });

    const monthlyCashflow = Array.from(monthlyMap.values());

    // Build category breakdown
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
      .map(([cat, amount]) => ({
        category: cat,
        name: CATEGORY_LABELS[cat] || cat.replace(/_/g, ' '),
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        color: CATEGORY_COLORS[cat] || EXPENSE_COLOR,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      pendingReceivables,
      monthlyCashflow,
      categoryBreakdown,
    };
  }, [transactions, pendingReceivables]);

  // CRUD Methods
  const createTransaction = async (
    data: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      // An empty created_by falls back to the column default (the caller's JWT email).
      const { created_by, ...rest } = data;
      const row = created_by ? data : rest;
      const { data: inserted, error: insertError } = await supabase
        .from('financial_transactions')
        .insert([row])
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchData();
      return inserted;
    } catch (err: any) {
      console.error('Create transaction failed:', err);
      throw err;
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<FinancialTransaction>
  ) => {
    try {
      const { data: updated, error: updateError } = await supabase
        .from('financial_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchData();
      return updated;
    } catch (err: any) {
      console.error('Update transaction failed:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchData();
    } catch (err: any) {
      console.error('Delete transaction failed:', err);
      throw err;
    }
  };

  return {
    transactions,
    summary,
    loading,
    error,
    live,
    refresh: fetchData,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
