'use client';

import { useState } from 'react';
import { useSavingsGoal } from '@/hooks/useSavingsGoal';
import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/formatters';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

export function HaircutFund() {
  const { goal, progress, isLoading, updateGoal } = useSavingsGoal();
  const { haircutAllocation } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [editPercent, setEditPercent] = useState('');

  if (isLoading) return <SkeletonCard />;
  if (!goal) return null;

  const handleSavePercent = async () => {
    const val = parseFloat(editPercent);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      await updateGoal({ allocate_percent: val });
    }
    setIsEditing(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✂️</span>
          <h3 className="text-sm font-semibold text-ink-800">{goal.name}</h3>
        </div>
        <span className="text-xs font-medium text-clay-500">{progress}%</span>
      </div>

      <ProgressBar value={progress} size="md" color="clay" />

      <div className="flex items-center justify-between mt-2.5">
        <span className="text-xs text-sand-400">
          {formatCurrency(Number(goal.current_amount))}
        </span>
        <span className="text-xs font-medium text-ink-600">
          {formatCurrency(Number(goal.target_amount))}
        </span>
      </div>

      {/* Allocation info */}
      <div className="mt-3 pt-3 border-t border-sand-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-sand-400">แบ่งรายได้</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={editPercent}
                  onChange={(e) => setEditPercent(e.target.value)}
                  className="w-14 bg-sand-100 border border-sand-200 rounded-lg px-2 py-0.5 text-xs text-ink-800 text-center focus:outline-none focus:ring-1 focus:ring-clay-500/30"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSavePercent(); }}
                />
                <span className="text-[11px] text-sand-400">%</span>
                <button
                  onClick={handleSavePercent}
                  className="text-[10px] text-clay-500 font-medium ml-1"
                >
                  ✓
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditPercent(String(goal.allocate_percent));
                  setIsEditing(true);
                }}
                className="text-xs font-semibold text-clay-600 hover:text-clay-700 transition-colors"
              >
                {goal.allocate_percent}%
              </button>
            )}
          </div>
          {haircutAllocation > 0 && (
            <span className="text-[11px] text-clay-500 font-medium">
              +{formatCurrency(haircutAllocation)}/เดือน
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
