'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/formatters';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

export function AvailableCash() {
  const { availableCash, haircutAllocation, isLoading } = useDashboard();

  if (isLoading) return <SkeletonCard />;

  const isPositive = availableCash >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-ceramic-600 p-5 shadow-lg">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <p className="text-sand-300 text-xs font-medium uppercase tracking-wider mb-1">
          เงินคงเหลือ
        </p>
        <div className="flex items-baseline gap-1.5 mb-4">
          <span
            className={`text-3xl font-bold font-[var(--font-display)] tracking-tight animate-count-up ${
              isPositive ? 'text-sand-50' : 'text-clay-400'
            }`}
          >
            {formatCurrency(availableCash)}
          </span>
        </div>

        <p className="text-sand-400 text-[11px]">
          รายรับ − รายจ่าย − หนี้รายเดือน{haircutAllocation > 0 ? ` − เก็บ Haircut` : ''}
        </p>
        {haircutAllocation > 0 && (
          <p className="text-sand-500 text-[10px] mt-0.5">
            ✂️ แบ่งเก็บ Haircut เดือนนี้: {formatCurrency(haircutAllocation)}
          </p>
        )}
      </div>
    </div>
  );
}
