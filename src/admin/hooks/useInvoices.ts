import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export type InvoiceSummary = {
  id: string;
  no_inv: string;
  client_name: string;
  payment_type: string;
  grand_total: number;
  created_at: string;
  updated_at: string;
};

export type InvoiceRow = InvoiceSummary & {
  data: unknown;
};

export type SaveInvoiceInput = {
  id?: string;
  no_inv: string;
  client_name: string;
  payment_type: string;
  grand_total: number;
  data: unknown;
};

const SUMMARY_COLUMNS = 'id,no_inv,client_name,payment_type,grand_total,created_at,updated_at';

export function useInvoices() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Never load the JSON blobs for the list; only summary columns.
  const fetchInvoices = useCallback(async (isMounted: () => boolean = () => true) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('invoices')
        .select(SUMMARY_COLUMNS)
        .order('updated_at', { ascending: false });
      if (error) throw error;

      if (isMounted() && data) {
        setInvoices(
          (data as InvoiceSummary[]).map((row) => ({
            ...row,
            grand_total: Number(row.grand_total) || 0,
          }))
        );
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      if (isMounted()) setError(err?.message || 'Gagal memuat daftar invoice.');
    } finally {
      if (isMounted()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchInvoices(() => isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchInvoices]);

  const refresh = useCallback(() => fetchInvoices(), [fetchInvoices]);

  const getInvoice = async (id: string): Promise<InvoiceRow> => {
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (error) throw error;
    return { ...(data as InvoiceRow), grand_total: Number((data as InvoiceRow).grand_total) || 0 };
  };

  const saveInvoice = async (input: SaveInvoiceInput): Promise<InvoiceRow> => {
    const { id, ...rest } = input;
    const payload = id ? { id, ...rest } : rest;
    const { data, error } = await supabase.from('invoices').upsert(payload).select().single();
    if (error) throw error;
    await fetchInvoices();
    return { ...(data as InvoiceRow), grand_total: Number((data as InvoiceRow).grand_total) || 0 };
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    await fetchInvoices();
  };

  return { invoices, loading, error, refresh, getInvoice, saveInvoice, deleteInvoice };
}
