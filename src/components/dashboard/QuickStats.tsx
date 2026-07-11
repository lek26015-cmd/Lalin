'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

export function QuickStats() {
  const { totalIncome, totalExpenses, activeDebtMonthly, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const stats = [
    {
      label: 'รายรับ',
      amount: totalIncome,
      icon: '📈',
      color: 'text-bronze-500',
    },
    {
      label: 'รายจ่าย',
      amount: totalExpenses,
      icon: '📉',
      color: 'text-clay-600',
    },
    {
      label: 'หนี้/ด.',
      amount: activeDebtMonthly,
      icon: '💳',
      color: 'text-ceramic-500',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="!p-3 text-center">
          <span className="text-lg mb-1 block">{stat.icon}</span>
          <p className={`text-sm font-bold tabular-nums ${stat.color}`}>
            {formatCurrency(stat.amount)}
          </p>
          <p className="text-[10px] text-sand-400 mt-0.5 font-medium">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
