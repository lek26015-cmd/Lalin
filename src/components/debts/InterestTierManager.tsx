'use client';

import { useState, useCallback } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { DebtInterestTier, NewInterestTier } from '@/types';

interface InterestTierManagerProps {
  debtId: string;
  defaultRate: number;
  tiers: DebtInterestTier[];
  isLoading: boolean;
  onAddTier: (tier: NewInterestTier) => Promise<unknown>;
  onDeleteTier: (id: string) => Promise<void>;
  getCurrentRate: (installment: number) => number | null;
  currentInstallment: number;
}

export function InterestTierManager({
  debtId,
  defaultRate,
  tiers,
  isLoading,
  onAddTier,
  onDeleteTier,
  getCurrentRate,
  currentInstallment,
}: InterestTierManagerProps) {
  const [showForm, setShowForm] = useState(false);

  const activeRate = getCurrentRate(currentInstallment);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-ink-800">📊 อัตราดอกเบี้ย</h4>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-clay-500 font-medium bg-clay-500/10 px-3 py-1.5 rounded-lg hover:bg-clay-500/20 transition-colors"
        >
          + เพิ่มขั้น
        </button>
      </div>

      {/* Current rate highlight */}
      <Card className="!p-3 mb-3 bg-gradient-to-r from-bronze-500/10 to-transparent border-bronze-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-sand-400 font-medium">ดอกเบี้ยปัจจุบัน (งวดที่ {currentInstallment})</p>
            <p className="text-lg font-bold text-bronze-600 font-[var(--font-display)]">
              {activeRate !== null ? `${activeRate}%` : `${defaultRate}%`}
              <span className="text-xs font-normal text-sand-400 ml-1">ต่อปี</span>
            </p>
          </div>
          {activeRate !== null && activeRate !== defaultRate && (
            <span className="text-[10px] text-ceramic-500 font-medium bg-ceramic-500/10 px-2 py-1 rounded-full">
              ขั้นบันได
            </span>
          )}
        </div>
      </Card>

      {/* Tier list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
        </div>
      ) : tiers.length === 0 ? (
        <Card className="!py-4 text-center">
          <p className="text-xs text-sand-400">ใช้อัตราเดียว {defaultRate}% ตลอด</p>
          <p className="text-[10px] text-sand-300 mt-1">เพิ่มขั้นบันไดถ้าดอกเบี้ยเปลี่ยนตามเงื่อนไข</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier) => {
            const isCurrent =
              currentInstallment >= tier.from_installment &&
              (tier.to_installment === null || currentInstallment <= tier.to_installment);

            return (
              <Card
                key={tier.id}
                className={`!p-3 ${isCurrent ? 'ring-2 ring-bronze-500/30' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink-800">
                        {tier.interest_rate}%
                      </span>
                      <span className="text-[10px] text-sand-400">
                        งวด {tier.from_installment}
                        {tier.to_installment ? `–${tier.to_installment}` : '+'}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] text-bronze-600 bg-bronze-500/15 px-1.5 py-0.5 rounded-full font-medium">
                          ตอนนี้
                        </span>
                      )}
                    </div>
                    {tier.condition_note && (
                      <p className="text-[11px] text-sand-400 mt-0.5">{tier.condition_note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteTier(tier.id)}
                    className="text-xs text-sand-300 hover:text-red-500 transition-colors px-1"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Tier Form */}
      <AddTierForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        debtId={debtId}
        onSubmit={onAddTier}
      />
    </div>
  );
}

// Inline form component
function AddTierForm({
  isOpen,
  onClose,
  debtId,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  onSubmit: (tier: NewInterestTier) => Promise<unknown>;
}) {
  const [fromInst, setFromInst] = useState('');
  const [toInst, setToInst] = useState('');
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFromInst('');
    setToInst('');
    setRate('');
    setNote('');
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    const from = parseInt(fromInst);
    const rateVal = parseFloat(rate);

    if (isNaN(from) || from <= 0) {
      setError('กรุณาใส่งวดเริ่มต้น');
      return;
    }
    if (isNaN(rateVal) || rateVal < 0) {
      setError('กรุณาใส่อัตราดอกเบี้ย');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const to = parseInt(toInst);
      await onSubmit({
        debt_id: debtId,
        from_installment: from,
        to_installment: isNaN(to) ? undefined : to,
        interest_rate: rateVal,
        condition_note: note || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เพิ่มไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  }, [fromInst, toInst, rate, note, debtId, onSubmit, onClose, resetForm]);

  const inputClass =
    'w-full bg-sand-100 border border-sand-200 rounded-xl py-2.5 px-4 text-sm text-ink-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-400 transition-all';

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="เพิ่มขั้นดอกเบี้ย">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ink-600 mb-1.5 block">งวดเริ่มต้น</label>
            <input type="number" inputMode="numeric" value={fromInst} onChange={(e) => setFromInst(e.target.value)} placeholder="1" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 mb-1.5 block">ถึงงวด (เว้นว่าง = จนจบ)</label>
            <input type="number" inputMode="numeric" value={toInst} onChange={(e) => setToInst(e.target.value)} placeholder="12" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-600 mb-1.5 block">อัตราดอกเบี้ย (% ต่อปี)</label>
          <input type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" className={inputClass} />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-600 mb-1.5 block">เงื่อนไข (ไม่บังคับ)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น โปรโมชั่น 12 เดือนแรก" className={inputClass} />
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
            'บันทึกขั้นดอกเบี้ย'
          )}
        </button>
      </div>
    </BottomSheet>
  );
}
