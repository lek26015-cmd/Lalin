'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useProfile } from './useProfile';
import type { Debt, NewDebt, DebtStatus } from '@/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useDebts() {
  const { userId } = useProfile();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const fetchedRef = useRef(false);
  const configured = isSupabaseConfigured();

  const fetchDebts = useCallback(async () => {
    if (!userId || !configured) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setDebts((data as Debt[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debts');
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, configured]);

  const addDebt = useCallback(
    async (debt: NewDebt) => {
      if (!userId) throw new Error('Not authenticated');

      if (!configured) {
        const mock: Debt = {
          id: `mock-debt-${Date.now()}`,
          user_id: userId,
          name: debt.name,
          total_amount: debt.total_amount,
          paid_amount: 0,
          monthly_payment: debt.monthly_payment,
          interest_rate: debt.interest_rate ?? 0,
          start_date: debt.start_date ?? new Date().toISOString().split('T')[0],
          paid_installments: debt.paid_installments ?? 0,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setDebts((prev) => [mock, ...prev]);
        return mock;
      }

      try {
        const { data, error: insertError } = await supabase
          .from('debts')
          .insert({
            user_id: userId,
            name: debt.name,
            total_amount: debt.total_amount,
            monthly_payment: debt.monthly_payment,
            interest_rate: debt.interest_rate ?? 0,
            start_date: debt.start_date ?? new Date().toISOString().split('T')[0],
            paid_installments: debt.paid_installments ?? 0,
            paid_amount: 0,
            status: 'active' as DebtStatus,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        setDebts((prev) => [data as Debt, ...prev]);
        return data as Debt;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add debt';
        setError(msg);
        throw new Error(msg);
      }
    },
    [userId, supabase, configured]
  );

  const updateDebtStatus = useCallback(
    async (debtId: string, status: DebtStatus) => {
      if (!configured) {
        setDebts((prev) => prev.map((d) => (d.id === debtId ? { ...d, status } : d)));
        return;
      }
      try {
        const { error: updateError } = await supabase
          .from('debts')
          .update({ status })
          .eq('id', debtId);
        if (updateError) throw updateError;
        setDebts((prev) => prev.map((d) => (d.id === debtId ? { ...d, status } : d)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update debt');
      }
    },
    [supabase, configured]
  );

  const deleteDebt = useCallback(
    async (debtId: string) => {
      if (!configured) {
        setDebts((prev) => prev.filter((d) => d.id !== debtId));
        return;
      }
      try {
        const { error: deleteError } = await supabase.from('debts').delete().eq('id', debtId);
        if (deleteError) throw deleteError;
        setDebts((prev) => prev.filter((d) => d.id !== debtId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete debt');
      }
    },
    [supabase, configured]
  );

  // Computed values
  const activeDebts = debts.filter((d) => d.status === 'active');
  const totalDebt = activeDebts.reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);
  const monthlyObligation = activeDebts.reduce((sum, d) => sum + d.monthly_payment, 0);

  // Realtime
  useEffect(() => {
    if (!userId) { setIsLoading(false); return; }
    if (!configured) { setIsLoading(false); return; }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      (async () => { await fetchDebts(); })();
    }

    const channelName = `debts-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'debts', filter: `user_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newRow = payload.new as unknown as Debt;
          const oldRow = payload.old as unknown as { id: string };
          if (payload.eventType === 'INSERT') {
            setDebts((prev) => {
              if (prev.some((d) => d.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setDebts((prev) => prev.filter((d) => d.id !== oldRow.id));
          } else if (payload.eventType === 'UPDATE') {
            setDebts((prev) => prev.map((d) => (d.id === newRow.id ? newRow : d)));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, configured]);

  return {
    debts,
    activeDebts,
    totalDebt,
    monthlyObligation,
    isLoading,
    error,
    addDebt,
    updateDebtStatus,
    deleteDebt,
    refetch: fetchDebts,
  };
}
