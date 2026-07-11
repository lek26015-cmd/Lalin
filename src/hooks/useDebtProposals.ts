'use client';

import { useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { DebtProposal, NewDebtProposal, ProposalStatus } from '@/types';

export function useDebtProposals(debtId: string | null) {
  const [proposals, setProposals] = useState<DebtProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const fetchProposals = useCallback(async () => {
    if (!debtId) return;

    if (!configured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('debt_proposals')
        .select('*')
        .eq('debt_id', debtId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data as DebtProposal[]) ?? []);
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debtId, supabase, configured]);

  const addProposal = useCallback(
    async (proposal: NewDebtProposal) => {
      if (!configured) {
        const mock: DebtProposal = {
          id: `mock-proposal-${Date.now()}`,
          debt_id: proposal.debt_id,
          type: proposal.type,
          new_monthly_payment: proposal.new_monthly_payment ?? null,
          new_total_installments: proposal.new_total_installments ?? null,
          new_interest_rate: proposal.new_interest_rate ?? null,
          original_amount: proposal.original_amount ?? null,
          proposed_amount: proposal.proposed_amount ?? null,
          conditions: proposal.conditions ?? null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProposals((prev) => [mock, ...prev]);
        return mock;
      }

      try {
        const { data, error } = await supabase
          .from('debt_proposals')
          .insert({
            debt_id: proposal.debt_id,
            type: proposal.type,
            new_monthly_payment: proposal.new_monthly_payment ?? null,
            new_total_installments: proposal.new_total_installments ?? null,
            new_interest_rate: proposal.new_interest_rate ?? null,
            original_amount: proposal.original_amount ?? null,
            proposed_amount: proposal.proposed_amount ?? null,
            conditions: proposal.conditions ?? null,
            status: 'draft',
          })
          .select()
          .single();

        if (error) throw error;
        setProposals((prev) => [data as DebtProposal, ...prev]);
        return data as DebtProposal;
      } catch (err) {
        console.error('Failed to add proposal:', err);
        throw err;
      }
    },
    [supabase, configured]
  );

  const updateProposalStatus = useCallback(
    async (proposalId: string, status: ProposalStatus) => {
      if (!configured) {
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status } : p))
        );
        return;
      }

      try {
        const { error } = await supabase
          .from('debt_proposals')
          .update({ status })
          .eq('id', proposalId);

        if (error) throw error;
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status } : p))
        );
      } catch (err) {
        console.error('Failed to update proposal status:', err);
      }
    },
    [supabase, configured]
  );

  const deleteProposal = useCallback(
    async (proposalId: string) => {
      if (!configured) {
        setProposals((prev) => prev.filter((p) => p.id !== proposalId));
        return;
      }

      try {
        const { error } = await supabase
          .from('debt_proposals')
          .delete()
          .eq('id', proposalId);

        if (error) throw error;
        setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      } catch (err) {
        console.error('Failed to delete proposal:', err);
      }
    },
    [supabase, configured]
  );

  return {
    proposals,
    isLoading,
    fetchProposals,
    addProposal,
    updateProposalStatus,
    deleteProposal,
  };
}
