'use client';

import type { MonthPayment } from '@/types';

interface MonthlyPaymentCalendarProps {
  payments: MonthPayment[];
  isLoading: boolean;
}

const STATUS_CONFIG = {
  paid: { icon: '✅', bg: 'bg-emerald-500/15', text: 'text-emerald-700', label: 'จ่ายแล้ว' },
  overdue: { icon: '❌', bg: 'bg-red-500/15', text: 'text-red-600', label: 'ค้างจ่าย' },
  upcoming: { icon: '⏳', bg: 'bg-sand-200/50', text: 'text-sand-400', label: 'ยังไม่ถึง' },
};

export function MonthlyPaymentCalendar({ payments, isLoading }: MonthlyPaymentCalendarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-sand-400 text-center py-4">ยังไม่มีข้อมูลการจ่าย</p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-sm font-semibold text-ink-800">📅 ปฏิทินจ่ายรายเดือน</h4>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {payments.map((m) => {
          const config = STATUS_CONFIG[m.status];
          return (
            <div
              key={m.month}
              className={`${config.bg} rounded-xl p-2.5 text-center transition-all`}
            >
              <p className="text-[10px] text-sand-400 font-medium uppercase mb-1">
                {m.label}
              </p>
              <p className="text-lg mb-0.5">{config.icon}</p>
              <p className={`text-xs font-semibold ${config.text}`}>
                {m.label}
              </p>
              <p className="text-[10px] text-sand-400 mt-0.5">{m.month}</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="text-xs">{cfg.icon}</span>
            <span className="text-[10px] text-sand-400">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
