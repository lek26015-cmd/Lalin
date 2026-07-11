'use client';

import { useDebts } from '@/hooks/useDebts';
import { DebtCard } from './DebtCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';
import type { DebtStatus } from '@/types';

export function DebtList() {
  const { debts, isLoading, updateDebtStatus } = useDebts();

  const handleToggle = (id: string) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;

    const newStatus: DebtStatus = debt.status === 'active' ? 'paused' : 'active';
    updateDebtStatus(id, newStatus);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="ยังไม่มีหนี้"
        description="เพิ่มหนี้เพื่อเริ่มจัดการการชำระ"
      />
    );
  }

  // Group by status
  const activeDebts = debts.filter((d) => d.status === 'active');
  const pausedDebts = debts.filter((d) => d.status === 'paused');
  const paidDebts = debts.filter((d) => d.status === 'paid');

  return (
    <div className="space-y-4">
      {activeDebts.length > 0 && (
        <div className="space-y-3">
          {activeDebts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} onToggleStatus={handleToggle} />
          ))}
        </div>
      )}

      {pausedDebts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-sand-400 uppercase tracking-wider mb-2 px-1">
            พักไว้
          </p>
          <div className="space-y-3 opacity-70">
            {pausedDebts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} onToggleStatus={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {paidDebts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-sand-400 uppercase tracking-wider mb-2 px-1">
            จ่ายครบแล้ว ✓
          </p>
          <div className="space-y-3 opacity-60">
            {paidDebts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
