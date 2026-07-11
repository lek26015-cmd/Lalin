'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { Card } from '@/components/ui/Card';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategoryConfig } from '@/lib/categories';
import { getRelativeDate } from '@/lib/formatters';

export function RecentTransactions() {
  const { transactions, isLoading } = useTransactions();

  const recent = transactions.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink-800">ล่าสุด</h3>
        {transactions.length > 5 && (
          <a href="/transactions" className="text-xs text-clay-500 font-medium">
            ดูทั้งหมด →
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState
          icon="📝"
          title="ยังไม่มีรายการ"
          description="กดปุ่ม + เพื่อเพิ่มรายการแรก"
        />
      ) : (
        <Card className="!p-0 divide-y divide-sand-200/40">
          {recent.map((tx, i) => {
            const cat = getCategoryConfig(tx.category);
            return (
              <div
                key={tx.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i === 0 ? 'animate-fade-in' : ''
                }`}
              >
                <span className="text-lg w-8 text-center">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">
                    {tx.category}
                  </p>
                  <p className="text-[11px] text-sand-400">
                    {getRelativeDate(tx.date)}
                    {tx.note ? ` · ${tx.note}` : ''}
                  </p>
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
      )}
    </div>
  );
}
