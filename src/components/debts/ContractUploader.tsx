'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/formatters';
import type { ContractAnalysisResult } from '@/types/contract';

interface ContractUploaderProps {
  onAnalysisComplete: (result: ContractAnalysisResult) => void;
  onClose: () => void;
}

type AnalysisState = 'idle' | 'preview' | 'analyzing' | 'result' | 'error';

export function ContractUploader({ onAnalysisComplete, onClose }: ContractUploaderProps) {
  const [state, setState] = useState<AnalysisState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ContractAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDataRef = useRef<{ base64: string; mimeType: string } | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('รองรับเฉพาะ JPEG, PNG, WebP, PDF');
      setState('error');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ไฟล์ใหญ่เกิน 10MB');
      setState('error');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Read as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      imageDataRef.current = { base64, mimeType: file.type };
      setState('preview');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageDataRef.current) return;

    setState('analyzing');
    setError(null);

    try {
      const res = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataRef.current.base64,
          mimeType: imageDataRef.current.mimeType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'วิเคราะห์ไม่สำเร็จ');
      }

      setResult(data.data);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setState('error');
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (result) {
      onAnalysisComplete(result);
    }
  }, [result, onAnalysisComplete]);

  const handleReset = useCallback(() => {
    setState('idle');
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    imageDataRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {state === 'idle' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            id="contract-upload-input"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-2 p-6 bg-sand-100 border-2 border-dashed border-sand-300 rounded-2xl hover:border-clay-400 hover:bg-clay-500/5 transition-all"
              id="contract-camera-btn"
            >
              <span className="text-3xl">📷</span>
              <span className="text-xs font-medium text-ink-600">ถ่ายรูปสัญญา</span>
            </button>

            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-2 p-6 bg-sand-100 border-2 border-dashed border-sand-300 rounded-2xl hover:border-clay-400 hover:bg-clay-500/5 transition-all"
              id="contract-file-btn"
            >
              <span className="text-3xl">📁</span>
              <span className="text-xs font-medium text-ink-600">เลือกไฟล์</span>
            </button>
          </div>

          <p className="text-[10px] text-sand-400 text-center mt-2">
            รองรับ JPEG, PNG, WebP, PDF · ไม่เกิน 10MB
          </p>
        </div>
      )}

      {/* Preview */}
      {state === 'preview' && previewUrl && (
        <div className="animate-fade-in">
          <div className="rounded-2xl overflow-hidden border border-sand-200 mb-3 max-h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="สัญญาที่อัพโหลด"
              className="w-full h-auto object-contain max-h-64"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReset}
              className="py-3 text-sm font-medium text-sand-500 bg-sand-100 rounded-xl hover:bg-sand-200 transition-colors"
            >
              เปลี่ยนรูป
            </button>
            <button
              onClick={handleAnalyze}
              className="py-3 text-sm font-semibold text-white bg-gradient-to-r from-clay-500 to-clay-600 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              🤖 วิเคราะห์
            </button>
          </div>
        </div>
      )}

      {/* Analyzing */}
      {state === 'analyzing' && (
        <Card className="!py-10 text-center animate-fade-in">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-ink-700 mt-4">
            🤖 AI กำลังอ่านสัญญา...
          </p>
          <p className="text-[11px] text-sand-400 mt-1">
            วิเคราะห์ดอกเบี้ย, ยอดผ่อน, เงื่อนไข
          </p>
        </Card>
      )}

      {/* Result */}
      {state === 'result' && result && (
        <div className="animate-fade-in space-y-3">
          <Card className="bg-emerald-50/50 border-emerald-200/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✅</span>
              <p className="text-sm font-semibold text-emerald-800">วิเคราะห์สำเร็จ</p>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">{result.raw_summary}</p>
          </Card>

          {/* Extracted data */}
          <Card className="!p-0 divide-y divide-sand-200/40">
            <ResultRow label="ชื่อหนี้" value={result.debt_name} />
            <ResultRow label="ประเภท" value={result.contract_type} />
            {result.creditor_name && <ResultRow label="เจ้าหนี้" value={result.creditor_name} />}
            <ResultRow label="ยอดหนี้" value={formatCurrency(result.total_amount)} highlight />
            <ResultRow label="ผ่อน/เดือน" value={formatCurrency(result.monthly_payment)} />
            {result.minimum_payment && (
              <ResultRow label="จ่ายขั้นต่ำ" value={formatCurrency(result.minimum_payment)} />
            )}
            <ResultRow label="ดอกเบี้ยหลัก" value={`${result.default_interest_rate}% ต่อปี`} />
          </Card>

          {/* Interest tiers */}
          {result.interest_tiers.length > 0 && (
            <Card>
              <p className="text-[10px] text-sand-400 font-medium uppercase tracking-wider mb-2">
                ขั้นบันไดดอกเบี้ย
              </p>
              <div className="space-y-1.5">
                {result.interest_tiers.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-ink-600">
                      งวด {tier.from_installment}
                      {tier.to_installment ? `–${tier.to_installment}` : '+'}
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-bronze-600">{tier.interest_rate}%</span>
                      {tier.condition_note && (
                        <p className="text-[10px] text-sand-400">{tier.condition_note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Special conditions */}
          {result.special_conditions.length > 0 && (
            <Card>
              <p className="text-[10px] text-sand-400 font-medium uppercase tracking-wider mb-2">
                เงื่อนไขพิเศษ
              </p>
              <ul className="space-y-1">
                {result.special_conditions.map((cond, i) => (
                  <li key={i} className="text-xs text-ink-600 flex gap-1.5">
                    <span className="text-sand-400">•</span>
                    {cond}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleReset}
              className="py-3 text-sm font-medium text-sand-500 bg-sand-100 rounded-xl hover:bg-sand-200 transition-colors"
            >
              สแกนใหม่
            </button>
            <button
              onClick={handleConfirm}
              className="py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              ✅ ใช้ข้อมูลนี้
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="animate-fade-in">
          <Card className="bg-red-50/50 border-red-200/60 text-center">
            <span className="text-3xl mb-2 block">❌</span>
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-red-500 font-medium underline"
            >
              ลองใหม่
            </button>
          </Card>
        </div>
      )}

      {/* Close button (always visible) */}
      {state !== 'analyzing' && (
        <button
          onClick={onClose}
          className="w-full py-2 text-xs text-sand-400 hover:text-ink-600 transition-colors"
        >
          ปิด
        </button>
      )}
    </div>
  );
}

// Helper row component
function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[11px] text-sand-400">{label}</span>
      <span
        className={`text-xs font-medium ${
          highlight ? 'text-clay-600 font-bold' : 'text-ink-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
