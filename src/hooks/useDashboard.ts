'use client';

import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useDebts } from './useDebts';
import { useSavingsGoal } from './useSavingsGoal';
import { getMonthStart, getMonthEnd } from '@/lib/formatters';
import type { DashboardData } from '@/types';

interface DashboardResult extends DashboardData {
  isLoading: boolean;
  dailyBudget: number;
  daysRemaining: number;
  haircutAllocation: number;
}

export function useDashboard(): DashboardResult {
  const { transactions, isLoading: txLoading } = useTransactions();
  const { monthlyObligation, isLoading: debtLoading } = useDebts();
  const { goal, isLoading: goalLoading } = useSavingsGoal();

  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  const computed = useMemo(() => {
    const currentMonthTx = transactions.filter(
      (t) => t.date >= monthStart && t.date <= monthEnd
    );

    const totalIncome = currentMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = currentMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Haircut fund allocation = X% of monthly income
    const allocPercent = goal?.allocate_percent ?? 0;
    const haircutAllocation = Math.round(totalIncome * (allocPercent / 100));

    // Available cash = income - expenses - debts - haircut allocation
    const availableCash = totalIncome - totalExpenses - monthlyObligation - haircutAllocation;

    // Daily budget = available cash / days remaining
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.max(endOfMonth.getDate() - now.getDate() + 1, 1);
    const dailyBudget = Math.max(availableCash / daysRemaining, 0);

    return {
      totalIncome,
      totalExpenses,
      activeDebtMonthly: monthlyObligation,
      availableCash,
      dailyBudget,
      daysRemaining,
      haircutAllocation,
    };
  }, [transactions, monthlyObligation, goal, monthStart, monthEnd]);

  return {
    ...computed,
    isLoading: txLoading || debtLoading || goalLoading,
  };
}
