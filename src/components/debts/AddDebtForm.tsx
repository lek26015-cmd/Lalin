'use client';

import { useState, useCallback } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ContractUploader } from '@/components/debts/ContractUploader';
import { useDebts } from '@/hooks/useDebts';
import { useDebtInterestTiers } from '@/hooks/useDebtInterestTiers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getToday } from '@/lib/formatters';
import type { ContractAnalysisResult } from '@/types/contract';

interface AddDebtFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDebtForm({ isOpen, onClose }: AddDebtFormProps) {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState(getToday());
  const [paidInstallments, setPaidInstallments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [aiTiers, setAiTiers] = useState<ContractAnalysisResult['interest_tiers']>([]);
  const [aiSource, setAiSource] = useState(false);

  const { addDebt } = useDebts();
  const { addTier } = useDebtInterestTiers(null);

  const resetForm = useCallback(() => {
    setName('');
    setTotalAmount('');
    setMonthlyPayment('');
    setInterestRate('');
    setStartDate(getToday());
    setPaidInstallments('');
    setError(null);
    setShowScanner(false);
    setAiTiers([]);
    setAiSource(false);
  }, []);

  // AI fills in the form
  const handleAIResult = useCallback((result: ContractAnalysisResult) => {
    setName(result.debt_name || '');
    setTotalAmount(String(result.total_amount || ''));
    setMonthlyPayment(String(result.monthly_payment || ''));
    setInterestRate(String(result.default_interest_rate || ''));
    if (result.start_date) setStartDate(result.start_date);
    if (result.paid_installments) setPaidInstallments(String(result.paid_installments));
    setAiTiers(result.interest_tiers || []);
    setAiSource(true);
    setShowScanner(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError('กรุณากรอกชื่อหนี้');
      return;
    }

    const total = parseFloat(totalAmount);
    const monthly = parseFloat(monthlyPayment);
    const interest = parseFloat(interestRate) || 0;

    if (isNaN(total) || total <= 0) {
      setError('กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }
    if (isNaN(monthly) || monthly <= 0) {
      setError('กรุณากรอกยอดผ่อนต่อเดือน');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newDebt = await addDebt({
        name: name.trim(),
        total_amount: total,
        monthly_payment: monthly,
        interest_rate: interest,
        start_date: startDate,
        paid_installments: parseInt(paidInstallments) || 0,
      });

      // Add AI-extracted interest tiers
      if (aiTiers.length > 0 && newDebt?.id) {
        for (const tier of aiTiers) {
          await addTier({
            debt_id: newDebt.id,
            from_installment: tier.from_installment,
            to_installment: tier.to_installment ?? undefined,
            interest_rate: tier.interest_rate,
            condition_note: tier.condition_note ?? undefined,
          });
        }
      }

      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เพิ่มหนี้ไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, totalAmount, monthlyPayment, interestRate, startDate, paidInstallments, aiTiers, addDebt, addTier, onClose, resetForm]);

  const inputClass =
    'w-full bg-sand-100 border border-sand-200 rounded-xl py-2.5 px-4 text-sm text-ink-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-400 transition-all';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="เพิ่มหนี้ใหม่"
    >
      <div className="space-y-4">
        {/* AI Scanner toggle */}
        {showScanner ? (
          <ContractUploader
            onAnalysisComplete={handleAIResult}
            onClose={() => setShowScanner(false)}
          />
        ) : (
          <>
            {/* Scan Contract Button */}
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500/90 to-indigo-500/90 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              id="scan-contract-btn"
            >
              <span className="text-lg">📷</span>
              สแกนสัญญาด้วย AI
            </button>

            {aiSource && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200/50 rounded-xl">
                <span className="text-sm">🤖</span>
                <p className="text-[11px] text-emerald-700 font-medium">
                  กรอกจาก AI แล้ว — ตรวจสอบข้อมูลก่อนบันทึก
                </p>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sand-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] text-sand-400">หรือกรอกเอง</span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1.5 block">ชื่อหนี้</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ผ่อนรถ, บัตรเครดิต"
                className={inputClass}
                id="add-debt-name"
              />
            </div>

            {/* Total Amount */}
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1.5 block">ยอดหนี้ทั้งหมด (฿)</label>
              <input
                type="number"
                inputMode="decimal"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0"
                className={inputClass}
                id="add-debt-total"
              />
            </div>

            {/* Monthly Payment */}
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1.5 block">ยอดผ่อนต่อเดือน (฿)</label>
              <input
                type="number"
                inputMode="decimal"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="0"
                className={inputClass}
                id="add-debt-monthly"
              />
            </div>

            {/* Interest Rate + Start Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink-600 mb-1.5 block">ดอกเบี้ย (% ต่อปี)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                  id="add-debt-interest"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600 mb-1.5 block">วันเริ่มผ่อน</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                  id="add-debt-start-date"
                />
              </div>
            </div>

            {/* Paid Installments */}
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1.5 block">จ่ายไปแล้วกี่งวด</label>
              <input
                type="number"
                inputMode="numeric"
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(e.target.value)}
                placeholder="0 (ถ้าเริ่มบันทึกตั้งแต่งวดแรก)"
                className={inputClass}
                id="add-debt-paid-installments"
              />
              <p className="text-[10px] text-sand-400 mt-1">ใส่จำนวนงวดที่จ่ายก่อนเริ่มใช้แอป</p>
            </div>

            {/* AI-extracted tiers preview */}
            {aiTiers.length > 0 && (
              <div className="p-3 bg-bronze-500/5 border border-bronze-500/15 rounded-xl">
                <p className="text-[10px] text-bronze-600 font-medium uppercase mb-2">
                  🤖 ดอกเบี้ยขั้นบันได (จาก AI)
                </p>
                {aiTiers.map((tier, i) => (
                  <div key={i} className="flex justify-between text-xs mb-1">
                    <span className="text-ink-600">
                      งวด {tier.from_installment}
                      {tier.to_installment ? `–${tier.to_installment}` : '+'}
                    </span>
                    <span className="font-semibold text-bronze-600">{tier.interest_rate}%</span>
                  </div>
                ))}
                <p className="text-[10px] text-sand-400 mt-1">จะบันทึกขั้นดอกเบี้ยอัตโนมัติ</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl animate-fade-in">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-clay-500 to-clay-600 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-active flex items-center justify-center gap-2"
              id="add-debt-submit"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="[&>div]:border-white/30 [&>div]:border-t-white" />
              ) : (
                'เพิ่มหนี้'
              )}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
