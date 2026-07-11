'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useProfile } from './useProfile';
import type { Transaction, NewTransaction } from '@/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useTransactions() {
  const { userId } = useProfile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const fetchedRef = useRef(false);
  const configured = isSupabaseConfigured();

  // Fetch all transactions for the user
  const fetchTransactions = useCallback(async () => {
    if (!userId || !configured) return;

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions((data as Transaction[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, configured]);

  // Update debt after a payment (defined before addTransaction)
  const updateDebtAfterPayment = useCallback(
    async (debtId: string, paymentAmount: number) => {
      if (!configured) return;
      try {
        const { data: debt, error: debtError } = await supabase
          .from('debts')
          .select('*')
          .eq('id', debtId)
          .single();

        if (debtError) throw debtError;
        if (!debt) return;

        const newPaidAmount = (debt.paid_amount ?? 0) + paymentAmount;
        const isPaid = newPaidAmount >= debt.total_amount;

        await supabase
          .from('debts')
          .update({
            paid_amount: newPaidAmount,
            status: isPaid ? 'paid' : debt.status,
          })
          .eq('id', debtId);
      } catch (err) {
        console.error('Failed to update debt after payment:', err);
      }
    },
    [supabase, configured]
  );

  // Add a new transaction
  const addTransaction = useCallback(
    async (tx: NewTransaction) => {
      if (!userId) throw new Error('Not authenticated');

      // Dev mode: create mock transaction locally
      if (!configured) {
        const mock: Transaction = {
          id: `mock-${Date.now()}`,
          user_id: userId,
          type: tx.type,
          category: tx.category,
          amount: tx.amount,
          date: tx.date,
          note: tx.note ?? null,
          debt_id: tx.debt_id ?? null,
          created_at: new Date().toISOString(),
        };
        setTransactions((prev) => [mock, ...prev]);
        return mock;
      }

      try {
        const { data, error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: tx.type,
            category: tx.category,
            amount: tx.amount,
            date: tx.date,
            note: tx.note ?? null,
            debt_id: tx.debt_id ?? null,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (tx.category === 'Debt Payment' && tx.debt_id) {
          await updateDebtAfterPayment(tx.debt_id, tx.amount);
        }

        setTransactions((prev) => [data as Transaction, ...prev]);
        return data as Transaction;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add transaction';
        setError(msg);
        throw new Error(msg);
      }
    },
    [userId, supabase, configured, updateDebtAfterPayment]
  );

  // Delete a transaction
  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!userId) return;

      if (!configured) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        return;
      }

      try {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      }
    },
    [userId, supabase, configured]
  );

  // Realtime subscription + initial fetch
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Skip Supabase when not configured (dev mode)
    if (!configured) {
      setIsLoading(false);
      return;
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      (async () => { await fetchTransactions(); })();
    }

    const channelName = `transactions-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newRow = payload.new as unknown as Transaction;
          const oldRow = payload.old as unknown as { id: string };
          if (payload.eventType === 'INSERT') {
            setTransactions((prev) => {
              if (prev.some((t) => t.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setTransactions((prev) =>
              prev.filter((t) => t.id !== oldRow.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setTransactions((prev) =>
              prev.map((t) =>
                t.id === newRow.id ? newRow : t
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, configured]);

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
