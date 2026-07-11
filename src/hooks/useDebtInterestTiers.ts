'use client';

import { useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { DebtInterestTier, NewInterestTier } from '@/types';

export function useDebtInterestTiers(debtId: string | null) {
  const [tiers, setTiers] = useState<DebtInterestTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const fetchTiers = useCallback(async () => {
    if (!debtId) return;

    if (!configured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('debt_interest_tiers')
        .select('*')
        .eq('debt_id', debtId)
        .order('from_installment', { ascending: true });

      if (error) throw error;
      setTiers((data as DebtInterestTier[]) ?? []);
    } catch (err) {
      console.error('Failed to fetch interest tiers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debtId, supabase, configured]);

  const addTier = useCallback(
    async (tier: NewInterestTier) => {
      if (!configured) {
        const mock: DebtInterestTier = {
          id: `mock-tier-${Date.now()}`,
          debt_id: tier.debt_id,
          from_installment: tier.from_installment,
          to_installment: tier.to_installment ?? null,
          interest_rate: tier.interest_rate,
          condition_note: tier.condition_note ?? null,
          created_at: new Date().toISOString(),
        };
        setTiers((prev) =>
          [...prev, mock].sort((a, b) => a.from_installment - b.from_installment)
        );
        return mock;
      }

      try {
        const { data, error } = await supabase
          .from('debt_interest_tiers')
          .insert({
            debt_id: tier.debt_id,
            from_installment: tier.from_installment,
            to_installment: tier.to_installment ?? null,
            interest_rate: tier.interest_rate,
            condition_note: tier.condition_note ?? null,
          })
          .select()
          .single();

        if (error) throw error;
        setTiers((prev) =>
          [...prev, data as DebtInterestTier].sort(
            (a, b) => a.from_installment - b.from_installment
          )
        );
        return data as DebtInterestTier;
      } catch (err) {
        console.error('Failed to add interest tier:', err);
        throw err;
      }
    },
    [supabase, configured]
  );

  const deleteTier = useCallback(
    async (tierId: string) => {
      if (!configured) {
        setTiers((prev) => prev.filter((t) => t.id !== tierId));
        return;
      }

      try {
        const { error } = await supabase
          .from('debt_interest_tiers')
          .delete()
          .eq('id', tierId);
        if (error) throw error;
        setTiers((prev) => prev.filter((t) => t.id !== tierId));
      } catch (err) {
        console.error('Failed to delete interest tier:', err);
      }
    },
    [supabase, configured]
  );

  // Get current rate based on installment number
  const getCurrentRate = useCallback(
    (installmentNumber: number): number | null => {
      if (tiers.length === 0) return null;
      const tier = tiers.find(
        (t) =>
          installmentNumber >= t.from_installment &&
          (t.to_installment === null || installmentNumber <= t.to_installment)
      );
      return tier?.interest_rate ?? null;
    },
    [tiers]
  );

  return {
    tiers,
    isLoading,
    fetchTiers,
    addTier,
    deleteTier,
    getCurrentRate,
  };
}
