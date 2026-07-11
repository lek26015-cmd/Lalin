'use client';

import { useState, useCallback } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getToday } from '@/lib/formatters';
import type { CallResult, NewCallLog } from '@/types';

interface AddCallLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  onSubmit: (log: NewCallLog) => Promise<unknown>;
}

const RESULT_OPTIONS: { key: CallResult; label: string; icon: string }[] = [
  { key: 'connected', label: 'ติดต่อได้', icon: '📞' },
  { key: 'no_answer', label: 'ไม่รับสาย', icon: '📵' },
  { key: 'callback', label: 'โทรกลับ', icon: '🔁' },
  { key: 'meeting_set', label: 'นัดคุยต่อ', icon: '📅' },
];

export function AddCallLogForm({ isOpen, onClose, debtId, onSubmit }: AddCallLogFormProps) {
  const [callDate, setCallDate] = useState(getToday());
  const [result, setResult] = useState<CallResult>('connected');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setCallDate(getToday());
    setResult('connected');
    setNotes('');
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        debt_id: debtId,
        call_date: callDate,
        result,
        notes: notes || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  }, [debtId, callDate, result, notes, onSubmit, onClose, resetForm]);

  const inputClass =
    'w-full bg-sand-100 border border-sand-200 rounded-xl py-2.5 px-4 text-sm text-ink-800 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500/30 focus:border-clay-400 transition-all';

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="บันทึกการโทร">
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="text-xs font-medium text-ink-600 mb-1.5 block">วันที่โทร</label>
          <input type="date" value={callDate} onChange={(e) => setCallDate(e.target.value)} className={inputClass} />
        </div>

        {/* Result */}
        <div>
          <label className="text-xs font-medium text-ink-600 mb-2 block">ผลการโทร</label>
          <div className="grid grid-cols-2 gap-2">
            {RESULT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setResult(opt.key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  result === opt.key
                    ? 'bg-clay-500 text-white shadow-sm'
                    : 'bg-sand-100 text-ink-600 border border-sand-200 hover:border-clay-400'
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-ink-600 mb-1.5 block">สรุปสิ่งที่ตอบ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เจ้าหนี้พูดว่าอะไร..."
            rows={3}
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
            '📞 บันทึก'
          )}
        </button>
      </div>
    </BottomSheet>
  );
}
