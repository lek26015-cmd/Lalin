'use client';

import { useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { MonthPayment, MonthlyPaymentStatus } from '@/types';

export function useMonthlyPayments(debtId: string | null, startDate: string | null) {
  const [payments, setPayments] = useState<MonthPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const fetchPaymentHistory = useCallback(
    async (monthsBack: number = 6) => {
      if (!debtId || !startDate) return;

      const now = new Date();
      const start = new Date(startDate);
      const months: MonthPayment[] = [];

      // Generate month list (from start_date or N months back, whichever is later)
      for (let i = monthsBack - 1; i >= -1; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        if (d < start) continue;

        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const isUpcoming = d > now;

        months.push({
          month: monthKey,
          label: new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(d),
          status: isUpcoming ? 'upcoming' : 'overdue', // default to overdue, will update below
          amount: 0,
        });
      }

      if (!configured) {
        // Dev mode: just return the month structure with all overdue/upcoming
        setPayments(months);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch all transactions for this debt
        const { data, error } = await supabase
          .from('transactions')
          .select('date, amount')
          .eq('debt_id', debtId)
          .eq('category', 'Debt Payment')
          .order('date', { ascending: true });

        if (error) throw error;

        // Group transaction amounts by month
        const paidByMonth: Record<string, number> = {};
        for (const tx of data ?? []) {
          const txMonth = (tx.date as string).substring(0, 7);
          paidByMonth[txMonth] = (paidByMonth[txMonth] ?? 0) + Number(tx.amount);
        }

        // Update status based on payments
        const result = months.map((m) => {
          if (m.status === 'upcoming') return m;
          const paid = paidByMonth[m.month] ?? 0;
          return {
            ...m,
            amount: paid,
            status: (paid > 0 ? 'paid' : 'overdue') as MonthlyPaymentStatus,
          };
        });

        setPayments(result);
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [debtId, startDate, supabase, configured]
  );

  return {
    payments,
    isLoading,
    fetchPaymentHistory,
  };
}
