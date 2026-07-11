'use client';

import { useState, useCallback } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ProposalType, NewDebtProposal } from '@/types';

interface AddProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  debtAmount: number;
  onSubmit: (proposal: NewDebtProposal) => Promise<unknown>;
}

export function AddProposalForm({ isOpen, onClose, debtId, debtAmount, onSubmit }: AddProposalFormProps) {
  const [type, setType] = useState<ProposalType>('restructure');
  const [newMonthly, setNewMonthly] = useState('');
  const [newInstallments, setNewInstallments] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [conditions, setConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setNewMonthly('');
    setNewInstallments('');
    setNewInterest('');
    setProposedAmount('');
    setConditions('');
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const proposal: NewDebtProposal = {
        debt_id: debtId,
        type,
        conditions: conditions || undefined,
      };

      if (type === 'restructure') {
        if (newMonthly) proposal.new_monthly_payment = parseFloat(newMonthly);
        if (newInstallments) proposal.new_total_installments = parseInt(newInstallments);
        if (newInterest) proposal.new_interest_rate = parseFloat(newInterest);
      } else {
        proposal.original_amount = debtAmount;
        if (proposedAmount) proposal.proposed_amount = parseFloat(proposedAmount);
      }

      await onSubmit(proposal);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เพิ่มข้อเสนอไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  }, [type, debtId, debtAmount, newMonthly, newInstallments, newInterest, proposedAmount, conditions, onSubmit, onClose, resetForm]);

  const inputClass =
    'w-full bg-sand-100 border border-sand-200 rounded-xl py-2.5 px-4 text-sm text-ink-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-400 transition-all';

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="เพิ่มข้อเสนอ">
      <div className="space-y-4">
        {/* Type selector */}
        <div className="flex gap-2 p-1 bg-sand-200/50 rounded-xl">
          {[
            { key: 'restructure' as const, label: '🔄 ปรับโครงสร้าง' },
            { key: 'haircut' as const, label: '✂️ Haircut' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === t.key
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-sand-400 hover:text-ink-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Restructure fields */}
        {type === 'restructure' && (
          <>
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1.5 block">ผ่อนใหม่ (฿/เดือน)</label>
              <input type="number" inputMode="decimal" value={newMonthly} onChange={(e) => setNewMonthly(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink-600 mb-1.5 block">จำนวนงวดใหม่</label>
                <input type="number" inputMode="numeric" value={newInstallments} onChange={(e) => setNewInstallments(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600 mb-1.5 block">ดอกเบี้ยใหม่ (%)</label>
                <input type="number" inputMode="decimal" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="0" className={inputClass} />
              </div>
            </div>
          </>
        )}

        {/* Haircut fields */}
        {type === 'haircut' && (
          <div>
            <label className="text-xs font-medium text-ink-600 mb-1.5 block">
              ยอดที่ขอจ่ายจริง (฿) <span className="text-sand-400">จากยอดเดิม {debtAmount.toLocaleString()}</span>
            </label>
            <input type="number" inputMode="decimal" value={proposedAmount} onChange={(e) => setProposedAmount(e.target.value)} placeholder="0" className={inputClass} />
          </div>
        )}

        {/* Conditions */}
        <div>
          <label className="text-xs font-medium text-ink-600 mb-1.5 block">เงื่อนไข (ไม่บังคับ)</label>
          <textarea
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="เช่น จ่ายครั้งเดียว, ผ่อน 12 งวด"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl animate-fade-in">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-clay-500 to-clay-600 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-all touch-active flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" className="[&>div]:border-white/30 [&>div]:border-t-white" />
          ) : (
            'บันทึกข้อเสนอ'
          )}
        </button>
      </div>
    </BottomSheet>
  );
}
