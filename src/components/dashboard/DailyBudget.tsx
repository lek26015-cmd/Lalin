'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/formatters';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

export function DailyBudget() {
  const { dailyBudget, daysRemaining, availableCash, isLoading } = useDashboard();

  if (isLoading) return <SkeletonCard />;

  const isWarning = dailyBudget > 0 && dailyBudget < 200;
  const isDanger = dailyBudget <= 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 shadow-sm border ${
      isDanger
        ? 'bg-gradient-to-br from-red-50 to-red-100/80 border-red-200/60'
        : isWarning
          ? 'bg-gradient-to-br from-amber-50 to-orange-100/60 border-amber-200/60'
          : 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-200/60'
    }`}>
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">
            {isDanger ? '🚨' : isWarning ? '⚠️' : '💚'}
          </span>
          <p className={`text-xs font-medium ${
            isDanger ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            วันนี้ใช้ได้ไม่เกิน
          </p>
        </div>

        <p className={`text-2xl font-bold font-[var(--font-display)] tabular-nums ${
          isDanger ? 'text-red-700' : isWarning ? 'text-amber-800' : 'text-emerald-800'
        }`}>
          {formatCurrency(Math.round(dailyBudget))}
        </p>

        <div className="flex items-center justify-between mt-2">
          <p className={`text-[11px] ${
            isDanger ? 'text-red-500' : isWarning ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            เหลือ {daysRemaining} วัน · คงเหลือ {formatCurrency(availableCash)}
          </p>
        </div>

        {isDanger && (
          <p className="text-[11px] text-red-500 mt-1.5 font-medium">
            ⚡ เงินหมดแล้ว — ลดรายจ่ายหรือเพิ่มรายได้ด่วน!
          </p>
        )}
      </div>
    </div>
  );
}
