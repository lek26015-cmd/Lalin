'use client';

import { useDebts } from '@/hooks/useDebts';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

export function DebtSummary() {
  const { debts, totalDebt, monthlyObligation, activeDebts, isLoading } = useDebts();

  if (isLoading) return <SkeletonCard />;

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <Card className="!p-3">
        <p className="text-[10px] text-sand-400 font-medium uppercase tracking-wider mb-1">
          จำนวนหนี้
        </p>
        <p className="text-xl font-bold text-ink-800 tabular-nums font-[var(--font-display)]">
          {debts.length}
        </p>
        <p className="text-[10px] text-sand-400 mt-0.5">
          {activeDebts.length} กำลังจ่าย
        </p>
      </Card>
      <Card className="!p-3">
        <p className="text-[10px] text-sand-400 font-medium uppercase tracking-wider mb-1">
          หนี้คงเหลือ
        </p>
        <p className="text-lg font-bold text-clay-600 tabular-nums font-[var(--font-display)]">
          {formatCurrency(totalDebt)}
        </p>
        <p className="text-[10px] text-sand-400 mt-0.5">ยอดรวม</p>
      </Card>
      <Card className="!p-3">
        <p className="text-[10px] text-sand-400 font-medium uppercase tracking-wider mb-1">
          ต่อเดือน
        </p>
        <p className="text-lg font-bold text-ceramic-500 tabular-nums font-[var(--font-display)]">
          {formatCurrency(monthlyObligation)}
        </p>
        <p className="text-[10px] text-sand-400 mt-0.5">ต้องจ่าย</p>
      </Card>
    </div>
  );
}
