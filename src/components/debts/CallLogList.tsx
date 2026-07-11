'use client';

import type { DebtCallLog, CallResult } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatDateFull } from '@/lib/formatters';

interface CallLogListProps {
  callLogs: DebtCallLog[];
  callLogsByMonth: Record<string, DebtCallLog[]>;
  currentMonthCount: number;
  resultLabels: Record<CallResult, string>;
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const RESULT_ICONS: Record<CallResult, string> = {
  connected: '📞',
  no_answer: '📵',
  callback: '🔁',
  meeting_set: '📅',
};

const RESULT_COLORS: Record<CallResult, string> = {
  connected: 'text-emerald-700 bg-emerald-500/15',
  no_answer: 'text-red-600 bg-red-500/15',
  callback: 'text-amber-700 bg-amber-500/15',
  meeting_set: 'text-blue-700 bg-blue-500/15',
};

export function CallLogList({
  callLogsByMonth,
  currentMonthCount,
  resultLabels,
  isLoading,
  onDelete,
}: CallLogListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
      </div>
    );
  }

  const months = Object.keys(callLogsByMonth).sort().reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-ink-800">📞 บันทึกการโทร</h4>
        <span className="text-xs text-clay-500 font-medium">
          เดือนนี้ {currentMonthCount} ครั้ง
        </span>
      </div>

      {months.length === 0 ? (
        <p className="text-sm text-sand-400 text-center py-4">ยังไม่มีบันทึกการโทร</p>
      ) : (
        <div className="space-y-4">
          {months.map((month) => (
            <div key={month}>
              <p className="text-[10px] font-medium text-sand-400 uppercase tracking-wider mb-2 px-1">
                {month} · {callLogsByMonth[month].length} ครั้ง
              </p>
              <Card className="!p-0 divide-y divide-sand-200/40">
                {callLogsByMonth[month].map((log) => (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-lg mt-0.5">{RESULT_ICONS[log.result]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${RESULT_COLORS[log.result]}`}>
                          {resultLabels[log.result]}
                        </span>
                        <span className="text-[11px] text-sand-400">
                          {formatDateFull(log.call_date)}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-ink-600 mt-1">{log.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDelete(log.id)}
                      className="text-[10px] text-sand-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
