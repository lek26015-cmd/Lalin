'use client';

import Link from 'next/link';
import type { Debt } from '@/types';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DebtStatusBadge } from '@/components/ui/Badge';
import { formatCurrency, calcPercentage } from '@/lib/formatters';

interface DebtCardProps {
  debt: Debt;
  onToggleStatus?: (id: string) => void;
}

export function DebtCard({ debt, onToggleStatus }: DebtCardProps) {
  const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
  const progress = calcPercentage(Number(debt.paid_amount), Number(debt.total_amount));

  const progressColor =
    debt.status === 'paid' ? 'success' : debt.status === 'paused' ? 'ceramic' : 'clay';

  return (
    <Card className="animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-ink-800 truncate">{debt.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-sand-400">
              {formatCurrency(Number(debt.monthly_payment))}/เดือน
            </p>
            {Number(debt.interest_rate) > 0 && (
              <span className="text-[10px] text-ceramic-500 font-medium bg-ceramic-500/10 px-1.5 py-0.5 rounded-full">
                ดอกเบี้ย {debt.interest_rate}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DebtStatusBadge status={debt.status} />
          {onToggleStatus && debt.status !== 'paid' && (
            <button
              onClick={() => onToggleStatus(debt.id)}
              className="text-xs text-sand-400 hover:text-clay-500 transition-colors px-1"
              title={debt.status === 'active' ? 'พัก' : 'จ่ายต่อ'}
            >
              {debt.status === 'active' ? '⏸' : '▶️'}
            </button>
          )}
        </div>
      </div>

      <ProgressBar value={progress} size="sm" color={progressColor} />

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-sand-400">
          จ่ายแล้ว {formatCurrency(Number(debt.paid_amount))}
        </span>
        <span className="text-xs font-medium text-ink-600">
          เหลือ {formatCurrency(remaining)}
        </span>
      </div>

      {/* Detail link */}
      <Link
        href={`/debts/${debt.id}`}
        className="block mt-3 pt-2.5 border-t border-sand-200/50 text-center text-xs text-clay-500 font-medium hover:text-clay-700 transition-colors"
      >
        ดูรายละเอียด →
      </Link>
    </Card>
  );
}
