'use client';

import type { Transaction } from '@/types';
import { Card } from '@/components/ui/Card';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategoryConfig } from '@/lib/categories';
import { groupBy, getRelativeDate } from '@/lib/formatters';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="ไม่พบรายการ"
        description="ลองเปลี่ยนตัวกรองหรือเพิ่มรายการใหม่"
      />
    );
  }

  // Group by date
  const grouped = groupBy(transactions, (t) => t.date);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date}>
          {/* Date Header */}
          <p className="text-xs font-medium text-sand-400 uppercase tracking-wider mb-2 px-1">
            {getRelativeDate(date)}
          </p>

          {/* Transaction Items */}
          <Card className="!p-0 divide-y divide-sand-200/40">
            {grouped[date].map((tx) => {
              const cat = getCategoryConfig(tx.category);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-3 touch-active"
                >
                  <div className="w-9 h-9 rounded-xl bg-sand-200/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">{cat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">
                      {tx.category}
                    </p>
                    {tx.note && (
                      <p className="text-[11px] text-sand-400 truncate">{tx.note}</p>
                    )}
                  </div>
                  <AmountDisplay
                    amount={Number(tx.amount)}
                    type={tx.type}
                    size="sm"
                    showSign
                  />
                </div>
              );
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}
