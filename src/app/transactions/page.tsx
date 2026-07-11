'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { FloatingAddButton } from '@/components/entry/FloatingAddButton';
import { useTransactions } from '@/hooks/useTransactions';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/formatters';

export default function TransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const { transactions, isLoading } = useTransactions();

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  return (
    <AppShell>
      <div className="px-5 py-4 space-y-4">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-ink-900 font-[var(--font-display)]">
          ประวัติรายการ
        </h1>

        {/* Summary Bar */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-bronze-500 font-medium">
            ↑ {formatCurrency(summary.income)}
          </span>
          <span className="text-clay-600 font-medium">
            ↓ {formatCurrency(summary.expense)}
          </span>
          <span className="ml-auto text-ink-600 font-semibold">
            สุทธิ: {formatCurrency(summary.net)}
          </span>
        </div>

        {/* Filters */}
        <TransactionFilters activeFilter={filter} onFilterChange={setFilter} />

        {/* List */}
        {isLoading ? (
          <PageLoading />
        ) : (
          <TransactionList transactions={filtered} />
        )}
      </div>

      {/* FAB */}
      <FloatingAddButton />
    </AppShell>
  );
}
