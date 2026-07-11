'use client';

import { useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { DebtCallLog, NewCallLog, CallResult } from '@/types';

export function useDebtCallLogs(debtId: string | null) {
  const [callLogs, setCallLogs] = useState<DebtCallLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const fetchCallLogs = useCallback(async () => {
    if (!debtId) return;

    if (!configured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('debt_call_logs')
        .select('*')
        .eq('debt_id', debtId)
        .order('call_date', { ascending: false });

      if (error) throw error;
      setCallLogs((data as DebtCallLog[]) ?? []);
    } catch (err) {
      console.error('Failed to fetch call logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debtId, supabase, configured]);

  const addCallLog = useCallback(
    async (log: NewCallLog) => {
      if (!configured) {
        const mock: DebtCallLog = {
          id: `mock-call-${Date.now()}`,
          debt_id: log.debt_id,
          call_date: log.call_date,
          result: log.result,
          notes: log.notes ?? null,
          created_at: new Date().toISOString(),
        };
        setCallLogs((prev) => [mock, ...prev]);
        return mock;
      }

      try {
        const { data, error } = await supabase
          .from('debt_call_logs')
          .insert({
            debt_id: log.debt_id,
            call_date: log.call_date,
            result: log.result,
            notes: log.notes ?? null,
          })
          .select()
          .single();

        if (error) throw error;
        setCallLogs((prev) => [data as DebtCallLog, ...prev]);
        return data as DebtCallLog;
      } catch (err) {
        console.error('Failed to add call log:', err);
        throw err;
      }
    },
    [supabase, configured]
  );

  const deleteCallLog = useCallback(
    async (logId: string) => {
      if (!configured) {
        setCallLogs((prev) => prev.filter((l) => l.id !== logId));
        return;
      }

      try {
        const { error } = await supabase
          .from('debt_call_logs')
          .delete()
          .eq('id', logId);

        if (error) throw error;
        setCallLogs((prev) => prev.filter((l) => l.id !== logId));
      } catch (err) {
        console.error('Failed to delete call log:', err);
      }
    },
    [supabase, configured]
  );

  // Computed: group by month
  const callLogsByMonth = callLogs.reduce<Record<string, DebtCallLog[]>>((acc, log) => {
    const month = log.call_date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(log);
    return acc;
  }, {});

  // Current month call count
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthCount = callLogsByMonth[currentMonth]?.length ?? 0;

  // Call result labels (Thai)
  const RESULT_LABELS: Record<CallResult, string> = {
    connected: 'ติดต่อได้',
    no_answer: 'ไม่รับสาย',
    callback: 'โทรกลับ',
    meeting_set: 'นัดคุยต่อ',
  };

  return {
    callLogs,
    callLogsByMonth,
    currentMonthCount,
    isLoading,
    fetchCallLogs,
    addCallLog,
    deleteCallLog,
    RESULT_LABELS,
  };
}
