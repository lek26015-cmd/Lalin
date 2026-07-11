'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DebtStatusBadge } from '@/components/ui/Badge';
import { MonthlyPaymentCalendar } from '@/components/debts/MonthlyPaymentCalendar';
import { ProposalCard } from '@/components/debts/ProposalCard';
import { AddProposalForm } from '@/components/debts/AddProposalForm';
import { CallLogList } from '@/components/debts/CallLogList';
import { AddCallLogForm } from '@/components/debts/AddCallLogForm';
import { InterestTierManager } from '@/components/debts/InterestTierManager';
import { PaymentBreakdown } from '@/components/debts/PaymentBreakdown';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useDebts } from '@/hooks/useDebts';
import { useDebtProposals } from '@/hooks/useDebtProposals';
import { useDebtCallLogs } from '@/hooks/useDebtCallLogs';
import { useMonthlyPayments } from '@/hooks/useMonthlyPayments';
import { useDebtInterestTiers } from '@/hooks/useDebtInterestTiers';
import { formatCurrency, calcPercentage, formatDateFull } from '@/lib/formatters';

export default function DebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { debts, isLoading: debtsLoading } = useDebts();
  const debt = debts.find((d) => d.id === id);

  const { proposals, isLoading: proposalsLoading, fetchProposals, addProposal, updateProposalStatus, deleteProposal } = useDebtProposals(id);
  const { callLogs, callLogsByMonth, currentMonthCount, isLoading: callsLoading, fetchCallLogs, addCallLog, deleteCallLog, RESULT_LABELS } = useDebtCallLogs(id);
  const { payments, isLoading: paymentsLoading, fetchPaymentHistory } = useMonthlyPayments(id, debt?.start_date ?? null);
  const { tiers, isLoading: tiersLoading, fetchTiers, addTier, deleteTier, getCurrentRate } = useDebtInterestTiers(id);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showCallLogForm, setShowCallLogForm] = useState(false);

  // Fetch detail data when debt is loaded
  useEffect(() => {
    if (!debt) return;
    const loadData = async () => {
      await Promise.all([
        fetchProposals(),
        fetchCallLogs(),
        fetchPaymentHistory(6),
        fetchTiers(),
      ]);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debt?.id]);


  if (debtsLoading) {
    return <AppShell><PageLoading /></AppShell>;
  }

  if (!debt) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="text-center px-6">
            <span className="text-5xl mb-4 block">🔍</span>
            <h2 className="text-lg font-semibold text-ink-800 mb-2">ไม่พบหนี้นี้</h2>
            <Link href="/debts" className="text-sm text-clay-500 font-medium">← กลับหน้าจัดการหนี้</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
  const progress = calcPercentage(Number(debt.paid_amount), Number(debt.total_amount));

  return (
    <AppShell>
      <div className="px-5 py-4 space-y-5 pb-32">
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <Link href="/debts" className="text-sand-400 hover:text-ink-600 transition-colors text-lg">
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-ink-900 font-[var(--font-display)] truncate">
              {debt.name}
            </h1>
            <p className="text-xs text-sand-400">
              เริ่ม {formatDateFull(debt.start_date)}
            </p>
          </div>
          <DebtStatusBadge status={debt.status} />
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="!p-3">
            <p className="text-[10px] text-sand-400 font-medium uppercase mb-1">ยอดหนี้</p>
            <p className="text-lg font-bold text-ink-800 tabular-nums font-[var(--font-display)]">
              {formatCurrency(Number(debt.total_amount))}
            </p>
          </Card>
          <Card className="!p-3">
            <p className="text-[10px] text-sand-400 font-medium uppercase mb-1">คงเหลือ</p>
            <p className="text-lg font-bold text-clay-600 tabular-nums font-[var(--font-display)]">
              {formatCurrency(remaining)}
            </p>
          </Card>
          <Card className="!p-3">
            <p className="text-[10px] text-sand-400 font-medium uppercase mb-1">ดอกเบี้ย</p>
            <p className="text-lg font-bold text-bronze-500 tabular-nums font-[var(--font-display)]">
              {Number(debt.interest_rate)}%
            </p>
            <p className="text-[10px] text-sand-400">ต่อปี</p>
          </Card>
        </div>

        {/* Installment Tracking */}
        {(() => {
          const preAppMonths = Number(debt.paid_installments) || 0;
          const inAppMonths = payments.filter((p) => p.status === 'paid').length;
          const totalPaidMonths = preAppMonths + inAppMonths;
          const monthlyPmt = Number(debt.monthly_payment);
          const estTotalMonths = monthlyPmt > 0 ? Math.ceil(Number(debt.total_amount) / monthlyPmt) : 0;
          const monthsLeft = Math.max(estTotalMonths - totalPaidMonths, 0);

          return (
            <Card className="!p-0">
              <div className="grid grid-cols-3 divide-x divide-sand-200/50">
                <div className="p-3 text-center">
                  <p className="text-[10px] text-sand-400 font-medium mb-1">ผ่อน/เดือน</p>
                  <p className="text-base font-bold text-ceramic-500 tabular-nums font-[var(--font-display)]">
                    {formatCurrency(monthlyPmt)}
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] text-sand-400 font-medium mb-1">จ่ายแล้ว</p>
                  <p className="text-base font-bold text-emerald-700 tabular-nums font-[var(--font-display)]">
                    {totalPaidMonths} <span className="text-xs font-normal text-sand-400">งวด</span>
                  </p>
                  {preAppMonths > 0 && (
                    <p className="text-[9px] text-sand-400">ก่อนแอป {preAppMonths} · ในแอป {inAppMonths}</p>
                  )}
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] text-sand-400 font-medium mb-1">เหลืออีก</p>
                  <p className="text-base font-bold text-clay-600 tabular-nums font-[var(--font-display)]">
                    {monthsLeft} <span className="text-xs font-normal text-sand-400">งวด</span>
                  </p>
                  {monthsLeft > 0 && (
                    <p className="text-[9px] text-sand-400">~{Math.ceil(monthsLeft / 12)} ปี</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Progress */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-sand-400">ความคืบหน้า</span>
            <span className="text-xs font-semibold text-clay-500">{progress}%</span>
          </div>
          <ProgressBar value={progress} size="md" color="clay" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-sand-400">จ่ายแล้ว {formatCurrency(Number(debt.paid_amount))}</span>
            <span className="text-[11px] text-ink-600 font-medium">เหลือ {formatCurrency(remaining)}</span>
          </div>
        </Card>

        {/* Monthly Payment Calendar */}
        <Card>
          <MonthlyPaymentCalendar payments={payments} isLoading={paymentsLoading} />
        </Card>

        {/* Interest Rate Tiers */}
        <Card>
          <InterestTierManager
            debtId={id}
            defaultRate={Number(debt.interest_rate)}
            tiers={tiers}
            isLoading={tiersLoading}
            onAddTier={addTier}
            onDeleteTier={deleteTier}
            getCurrentRate={getCurrentRate}
            currentInstallment={(Number(debt.paid_installments) || 0) + payments.filter((p) => p.status === 'paid').length + 1}
          />
        </Card>

        {/* Payment Breakdown: principal vs interest */}
        <Card>
          <PaymentBreakdown
            balance={remaining}
            monthlyPayment={Number(debt.monthly_payment)}
            defaultRate={Number(debt.interest_rate)}
            tiers={tiers}
            currentInstallment={(Number(debt.paid_installments) || 0) + payments.filter((p) => p.status === 'paid').length + 1}
            totalAmount={Number(debt.total_amount)}
          />
        </Card>

        {/* Proposals Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink-800">📋 ข้อเสนอหนี้เสีย</h3>
            <button
              onClick={() => setShowProposalForm(true)}
              className="text-xs text-clay-500 font-medium bg-clay-500/10 px-3 py-1.5 rounded-lg hover:bg-clay-500/20 transition-colors"
            >
              + เพิ่มข้อเสนอ
            </button>
          </div>

          {proposalsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
            </div>
          ) : proposals.length === 0 ? (
            <Card className="!py-8 text-center">
              <span className="text-3xl mb-2 block">📝</span>
              <p className="text-sm text-sand-400">ยังไม่มีข้อเสนอ</p>
              <p className="text-[11px] text-sand-300 mt-1">เพิ่มข้อเสนอปรับโครงสร้างหรือ Haircut</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {proposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  onUpdateStatus={updateProposalStatus}
                  onDelete={deleteProposal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call Log Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink-800">📞 บันทึกการโทร</h3>
            <button
              onClick={() => setShowCallLogForm(true)}
              className="text-xs text-clay-500 font-medium bg-clay-500/10 px-3 py-1.5 rounded-lg hover:bg-clay-500/20 transition-colors"
            >
              + บันทึกโทร
            </button>
          </div>

          <CallLogList
            callLogs={callLogs}
            callLogsByMonth={callLogsByMonth}
            currentMonthCount={currentMonthCount}
            resultLabels={RESULT_LABELS}
            isLoading={callsLoading}
            onDelete={deleteCallLog}
          />
        </div>
      </div>

      {/* Bottom Sheet Forms */}
      <AddProposalForm
        isOpen={showProposalForm}
        onClose={() => setShowProposalForm(false)}
        debtId={id}
        debtAmount={Number(debt.total_amount)}
        onSubmit={addProposal}
      />

      <AddCallLogForm
        isOpen={showCallLogForm}
        onClose={() => setShowCallLogForm(false)}
        debtId={id}
        onSubmit={addCallLog}
      />
    </AppShell>
  );
}
