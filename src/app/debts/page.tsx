'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DebtSummary } from '@/components/debts/DebtSummary';
import { DebtList } from '@/components/debts/DebtList';
import { AddDebtForm } from '@/components/debts/AddDebtForm';
import { FloatingAddButton } from '@/components/entry/FloatingAddButton';

export default function DebtsPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <AppShell>
      <div className="px-5 py-4 space-y-5">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink-900 font-[var(--font-display)]">
            จัดการหนี้
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm font-medium text-clay-500 hover:text-clay-600 transition-colors px-3 py-1.5 rounded-lg bg-clay-500/10 touch-active"
            id="add-debt-btn"
          >
            + เพิ่มหนี้
          </button>
        </div>

        {/* Summary Cards */}
        <DebtSummary />

        {/* Debt List */}
        <DebtList />
      </div>

      {/* Add Debt Sheet */}
      <AddDebtForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />

      {/* FAB */}
      <FloatingAddButton />
    </AppShell>
  );
}
