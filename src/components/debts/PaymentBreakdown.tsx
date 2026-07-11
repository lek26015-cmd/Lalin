'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters';
import {
  calculatePaymentSummary,
  comparePaymentLevels,
  generateAmortizationSchedule,
  type AmortizationRow,
} from '@/lib/amortization';
import type { DebtInterestTier } from '@/types';

interface PaymentBreakdownProps {
  balance: number;        // ยอดคงเหลือ
  monthlyPayment: number; // ผ่อนต่อเดือน
  defaultRate: number;    // ดอกเบี้ย % default
  tiers: DebtInterestTier[];
  currentInstallment: number;
  totalAmount: number;
}

export function PaymentBreakdown({
  balance,
  monthlyPayment,
  defaultRate,
  tiers,
  currentInstallment,
  totalAmount,
}: PaymentBreakdownProps) {
  const [showSchedule, setShowSchedule] = useState(false);

  // Get active rate based on tiers
  const activeRate = useMemo(() => {
    const tier = tiers.find(
      (t) =>
        currentInstallment >= t.from_installment &&
        (t.to_installment === null || currentInstallment <= t.to_installment)
    );
    return tier ? Number(tier.interest_rate) : defaultRate;
  }, [tiers, currentInstallment, defaultRate]);

  // Payment summary for current month
  const summary = useMemo(
    () => calculatePaymentSummary(balance, monthlyPayment, activeRate),
    [balance, monthlyPayment, activeRate]
  );

  // Payment level comparison
  const comparisons = useMemo(
    () => comparePaymentLevels(balance, monthlyPayment, activeRate),
    [balance, monthlyPayment, activeRate]
  );

  // Amortization schedule (next 12 installments)
  const schedule = useMemo(() => {
    const tierData = tiers.map((t) => ({
      from: t.from_installment,
      to: t.to_installment,
      rate: Number(t.interest_rate),
    }));
    return generateAmortizationSchedule(
      balance, monthlyPayment, tierData, defaultRate, currentInstallment, 12
    );
  }, [balance, monthlyPayment, tiers, defaultRate, currentInstallment]);

  if (balance <= 0) return null;

  // Visual breakdown: ratio bar
  const interestRatio = summary.interestPortion / (monthlyPayment || 1);
  const principalRatio = summary.principalPortion / (monthlyPayment || 1);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <h4 className="text-sm font-semibold text-ink-800">💰 ตัดลดต้น-ลดดอก</h4>

      {/* Current month breakdown */}
      <Card className="!p-4">
        <p className="text-[10px] text-sand-400 font-medium uppercase tracking-wider mb-3">
          งวดถัดไป (งวดที่ {currentInstallment}) · ดอกเบี้ย {activeRate}%
        </p>

        {/* Payment bar visualization */}
        <div className="h-8 rounded-lg overflow-hidden flex mb-3">
          <div
            className="bg-red-400/80 flex items-center justify-center transition-all"
            style={{ width: `${Math.max(interestRatio * 100, 5)}%` }}
          >
            <span className="text-[9px] text-white font-bold">ดอก</span>
          </div>
          <div
            className="bg-emerald-500/80 flex items-center justify-center transition-all"
            style={{ width: `${Math.max(principalRatio * 100, 5)}%` }}
          >
            <span className="text-[9px] text-white font-bold">เงินต้น</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-sand-400 mb-0.5">จ่ายทั้งหมด</p>
            <p className="text-sm font-bold text-ink-800 tabular-nums">
              {formatCurrency(monthlyPayment)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-red-500 mb-0.5">ดอกเบี้ย</p>
            <p className="text-sm font-bold text-red-600 tabular-nums">
              {formatCurrency(summary.interestPortion)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-600 mb-0.5">ลดต้น</p>
            <p className="text-sm font-bold text-emerald-700 tabular-nums">
              {formatCurrency(summary.principalPortion)}
            </p>
          </div>
        </div>

        {/* Minimum payment warning */}
        <div className="mt-3 pt-3 border-t border-sand-200/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-sand-400">จ่ายขั้นต่ำ (แค่ดอก)</span>
            <span className="text-xs font-semibold text-red-500">
              {formatCurrency(summary.minimumPayment)}
            </span>
          </div>
          {monthlyPayment <= summary.monthlyInterest && (
            <p className="text-[10px] text-red-500 mt-1.5 font-medium">
              ⚠️ จ่ายแค่ดอก! ต้นเงินไม่ลดเลย
            </p>
          )}
        </div>
      </Card>

      {/* Payment Level Comparison */}
      <Card>
        <p className="text-[10px] text-sand-400 font-medium uppercase tracking-wider mb-3">
          เปรียบเทียบระดับการจ่าย
        </p>
        <div className="space-y-2.5">
          {comparisons.map((level) => {
            const isCurrent = level.paymentAmount === monthlyPayment;
            return (
              <div
                key={level.paymentAmount}
                className={`rounded-xl p-3 transition-all ${
                  isCurrent
                    ? 'bg-clay-500/10 ring-1 ring-clay-500/30'
                    : 'bg-sand-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink-800">
                      {formatCurrency(level.paymentAmount)}/ด.
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      isCurrent
                        ? 'bg-clay-500/20 text-clay-600'
                        : 'bg-sand-200/50 text-sand-400'
                    }`}>
                      {level.label}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-sand-400">หมดใน </span>
                    <span className="font-semibold text-ink-700">
                      {level.monthsToPayoff === -1
                        ? '∞'
                        : `${level.monthsToPayoff} ด.`}
                    </span>
                    {level.monthsToPayoff > 12 && level.monthsToPayoff !== -1 && (
                      <span className="text-sand-400">
                        {' '}({Math.round(level.monthsToPayoff / 12 * 10) / 10} ปี)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-sand-400">ดอกรวม </span>
                    <span className="font-semibold text-red-500">
                      {level.totalInterestPaid === -1
                        ? '∞'
                        : formatCurrency(level.totalInterestPaid)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sand-400">จ่ายรวม </span>
                    <span className="font-semibold text-ink-700">
                      {formatCurrency(level.totalPaid)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Amortization Schedule Toggle */}
      <div>
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full text-xs text-clay-500 font-medium py-2 hover:text-clay-700 transition-colors"
        >
          {showSchedule ? '▼ ซ่อนตารางผ่อน' : '▶ ดูตารางผ่อน 12 งวดถัดไป'}
        </button>

        {showSchedule && (
          <ScheduleTable schedule={schedule} />
        )}
      </div>
    </div>
  );
}

// Sub-component: Amortization schedule table
function ScheduleTable({ schedule }: { schedule: AmortizationRow[] }) {
  if (schedule.length === 0) {
    return <p className="text-sm text-sand-400 text-center py-4">หมดหนี้แล้ว 🎉</p>;
  }

  return (
    <Card className="!p-0 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-sand-100 text-sand-400 font-medium">
              <th className="py-2 px-2.5 text-left">งวด</th>
              <th className="py-2 px-2.5 text-right">ยอดก่อน</th>
              <th className="py-2 px-2.5 text-right text-red-400">ดอก</th>
              <th className="py-2 px-2.5 text-right text-emerald-500">ลดต้น</th>
              <th className="py-2 px-2.5 text-right">คงเหลือ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200/40">
            {schedule.map((row) => (
              <tr key={row.installment} className="hover:bg-sand-50 transition-colors">
                <td className="py-2 px-2.5 text-ink-600 font-medium">
                  {row.installment}
                  {row.interestRate > 0 && (
                    <span className="text-[9px] text-sand-300 ml-0.5">
                      ({row.interestRate}%)
                    </span>
                  )}
                </td>
                <td className="py-2 px-2.5 text-right text-ink-600 tabular-nums">
                  {formatCurrency(row.balance)}
                </td>
                <td className="py-2 px-2.5 text-right text-red-500 tabular-nums font-medium">
                  {formatCurrency(row.interestPortion)}
                </td>
                <td className="py-2 px-2.5 text-right text-emerald-600 tabular-nums font-medium">
                  {formatCurrency(row.principalPortion)}
                </td>
                <td className="py-2 px-2.5 text-right text-ink-800 tabular-nums font-semibold">
                  {formatCurrency(row.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
