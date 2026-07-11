'use client';

import { useState, useCallback } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { getCategoriesForType } from '@/lib/categories';
import { getToday } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type EntryTab = 'income' | 'expense' | 'debtPayment';

interface QuickEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickEntrySheet({ isOpen, onClose }: QuickEntrySheetProps) {
  const [activeTab, setActiveTab] = useState<EntryTab>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [selectedDebtId, setSelectedDebtId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { addTransaction } = useTransactions();
  const { activeDebts } = useDebts();

  const categories = getCategoriesForType(activeTab);

  const resetForm = useCallback(() => {
    setAmount('');
    setCategory('');
    setNote('');
    setSelectedDebtId('');
    setError(null);
    setSuccess(false);
  }, []);

  const handleTabChange = useCallback(
    (tab: EntryTab) => {
      setActiveTab(tab);
      setCategory('');
      setSelectedDebtId('');
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    // Validation
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณากรอกจำนวนเงิน');
      return;
    }

    const finalCategory = activeTab === 'debtPayment' ? 'Debt Payment' : category;
    if (!finalCategory) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (activeTab === 'debtPayment' && !selectedDebtId) {
      setError('กรุณาเลือกหนี้ที่ต้องการจ่าย');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addTransaction({
        type: activeTab === 'income' ? 'income' : 'expense',
        category: finalCategory,
        amount: numAmount,
        date: getToday(),
        note: note || undefined,
        debt_id: selectedDebtId || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, category, activeTab, selectedDebtId, note, addTransaction, onClose, resetForm]);

  const tabs: { key: EntryTab; label: string; icon: string }[] = [
    { key: 'income', label: 'รายรับ', icon: '📈' },
    { key: 'expense', label: 'รายจ่าย', icon: '📉' },
    { key: 'debtPayment', label: 'จ่ายหนี้', icon: '💳' },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="บันทึกรายการ">
      {/* Success overlay */}
      {success && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-sand-50/90 animate-fade-in">
          <div className="flex flex-col items-center gap-2 animate-scale-pop">
            <span className="text-5xl">✅</span>
            <p className="text-sm font-medium text-ink-800">บันทึกแล้ว!</p>
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex gap-1 p-1 bg-sand-200/50 rounded-xl mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-sand-400 hover:text-ink-600'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="mb-5">
        <label className="text-xs font-medium text-ink-600 mb-1.5 block">จำนวนเงิน (฿)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-sand-400 font-medium">฿</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-sand-100 border border-sand-200 rounded-xl py-3 pl-10 pr-4 text-2xl font-bold text-ink-900 font-[var(--font-display)] placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-400 transition-all"
            autoFocus
            id="quick-entry-amount"
          />
        </div>
      </div>

      {/* Category Chips */}
      {activeTab !== 'debtPayment' && (
        <div className="mb-5">
          <label className="text-xs font-medium text-ink-600 mb-2 block">หมวดหมู่</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  category === key
                    ? 'bg-clay-500 text-white shadow-sm'
                    : 'bg-sand-100 text-ink-600 border border-sand-200 hover:border-clay-400'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Debt Selector */}
      {activeTab === 'debtPayment' && (
        <div className="mb-5">
          <label className="text-xs font-medium text-ink-600 mb-2 block">เลือกหนี้</label>
          {activeDebts.length === 0 ? (
            <p className="text-sm text-sand-400 italic">ไม่มีหนี้ที่กำลังจ่าย</p>
          ) : (
            <div className="space-y-2">
              {activeDebts.map((debt) => (
                <button
                  key={debt.id}
                  onClick={() => setSelectedDebtId(debt.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-150 ${
                    selectedDebtId === debt.id
                      ? 'bg-clay-500/10 border-2 border-clay-500'
                      : 'bg-sand-100 border border-sand-200 hover:border-clay-400'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-ink-800">{debt.name}</p>
                    <p className="text-xs text-sand-400">
                      รายเดือน: ฿{Number(debt.monthly_payment).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-ink-600 font-medium">
                    ฿{(Number(debt.total_amount) - Number(debt.paid_amount)).toLocaleString()} เหลือ
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div className="mb-5">
        <label className="text-xs font-medium text-ink-600 mb-1.5 block">โน้ต (ไม่บังคับ)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เพิ่มโน้ต..."
          className="w-full bg-sand-100 border border-sand-200 rounded-xl py-2.5 px-4 text-sm text-ink-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-400 transition-all"
          id="quick-entry-note"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl animate-fade-in">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-3.5 bg-gradient-to-r from-clay-500 to-clay-600 text-white font-semibold rounded-xl shadow-sm shadow-clay-500/20 hover:shadow-md hover:shadow-clay-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-active flex items-center justify-center gap-2"
        id="quick-entry-submit"
      >
        {isSubmitting ? (
          <LoadingSpinner size="sm" className="[&>div]:border-white/30 [&>div]:border-t-white" />
        ) : (
          <>
            <span>บันทึก</span>
            <span className="text-base">
              {activeTab === 'income' ? '📈' : activeTab === 'expense' ? '📉' : '💳'}
            </span>
          </>
        )}
      </button>
    </BottomSheet>
  );
}
