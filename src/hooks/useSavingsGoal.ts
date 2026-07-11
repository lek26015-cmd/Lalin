'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useProfile } from './useProfile';
import type { SavingsGoal } from '@/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useSavingsGoal() {
  const { userId } = useProfile();
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const fetchedRef = useRef(false);
  const configured = isSupabaseConfigured();

  // Fetch or create default savings goal
  const fetchGoal = useCallback(async () => {
    if (!userId || !configured) return;

    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: created, error: createError } = await supabase
          .from('savings_goals')
          .insert({
            user_id: userId,
            name: 'Haircut Fund',
            target_amount: 500,
            current_amount: 0,
            allocate_percent: 10,
          })
          .select()
          .single();

        if (createError) throw createError;
        setGoal(created as SavingsGoal);
      } else if (fetchError) {
        throw fetchError;
      } else {
        setGoal(data as SavingsGoal);
      }
    } catch (err) {
      console.error('Failed to fetch savings goal:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, configured]);

  // Update savings goal
  const updateGoal = useCallback(
    async (updates: Partial<Pick<SavingsGoal, 'name' | 'target_amount' | 'current_amount' | 'allocate_percent'>>) => {
      if (!goal) return;

      if (!configured) {
        setGoal((prev) => prev ? { ...prev, ...updates } as SavingsGoal : prev);
        return;
      }

      try {
        const { data, error: updateError } = await supabase
          .from('savings_goals')
          .update(updates)
          .eq('id', goal.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setGoal(data as SavingsGoal);
      } catch (err) {
        console.error('Failed to update savings goal:', err);
      }
    },
    [goal, supabase, configured]
  );

  // Add to savings
  const addToSavings = useCallback(
    async (amount: number) => {
      if (!goal) return;

      const newAmount = Number(goal.current_amount) + amount;
      await updateGoal({ current_amount: newAmount });
    },
    [goal, updateGoal]
  );

  // Realtime + initial fetch
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Dev mode: create a mock savings goal, skip Supabase
    if (!configured) {
      setGoal({
        id: 'mock-goal-001',
        user_id: userId,
        name: 'Haircut Fund',
        target_amount: 500,
        current_amount: 150,
        allocate_percent: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      (async () => { await fetchGoal(); })();
    }

    const channelName = `savings-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'savings_goals',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          setGoal(payload.new as unknown as SavingsGoal);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, configured]);

  const progress = goal
    ? Math.min(
        Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100),
        100
      )
    : 0;

  return {
    goal,
    progress,
    isLoading,
    updateGoal,
    addToSavings,
  };
}
