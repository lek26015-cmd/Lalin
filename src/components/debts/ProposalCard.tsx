'use client';

import type { DebtProposal, ProposalStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters';

interface ProposalCardProps {
  proposal: DebtProposal;
  onUpdateStatus: (id: string, status: ProposalStatus) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'ร่าง', color: 'text-sand-500', bg: 'bg-sand-200/50' },
  proposed: { label: 'เสนอแล้ว', color: 'text-ceramic-600', bg: 'bg-ceramic-500/15' },
  accepted: { label: 'ยอมรับ', color: 'text-emerald-700', bg: 'bg-emerald-500/15' },
  rejected: { label: 'ปฏิเสธ', color: 'text-red-600', bg: 'bg-red-500/15' },
};

export function ProposalCard({ proposal, onUpdateStatus, onDelete }: ProposalCardProps) {
  const statusCfg = STATUS_CONFIG[proposal.status];
  const isRestructure = proposal.type === 'restructure';

  return (
    <Card className="animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isRestructure ? '🔄' : '✂️'}</span>
          <div>
            <h4 className="text-sm font-semibold text-ink-800">
              {isRestructure ? 'ปรับโครงสร้างหนี้' : 'Haircut ลดเงินต้น'}
            </h4>
            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(proposal.id)}
          className="text-xs text-sand-400 hover:text-red-500 transition-colors"
          title="ลบ"
        >
          🗑
        </button>
      </div>

      {/* Restructure details */}
      {isRestructure && (
        <div className="space-y-1.5 text-xs">
          {proposal.new_monthly_payment != null && (
            <div className="flex justify-between">
              <span className="text-sand-400">ผ่อนใหม่</span>
              <span className="text-ink-800 font-medium">
                {formatCurrency(Number(proposal.new_monthly_payment))}/เดือน
              </span>
            </div>
          )}
          {proposal.new_total_installments != null && (
            <div className="flex justify-between">
              <span className="text-sand-400">จำนวนงวด</span>
              <span className="text-ink-800 font-medium">{proposal.new_total_installments} งวด</span>
            </div>
          )}
          {proposal.new_interest_rate != null && (
            <div className="flex justify-between">
              <span className="text-sand-400">ดอกเบี้ยใหม่</span>
              <span className="text-ink-800 font-medium">{proposal.new_interest_rate}%</span>
            </div>
          )}
        </div>
      )}

      {/* Haircut details */}
      {!isRestructure && (
        <div className="space-y-1.5 text-xs">
          {proposal.original_amount != null && (
            <div className="flex justify-between">
              <span className="text-sand-400">ยอดเดิม</span>
              <span className="text-ink-800 font-medium line-through">
                {formatCurrency(Number(proposal.original_amount))}
              </span>
            </div>
          )}
          {proposal.proposed_amount != null && (
            <div className="flex justify-between">
              <span className="text-sand-400">ขอจ่ายจริง</span>
              <span className="text-emerald-700 font-bold">
                {formatCurrency(Number(proposal.proposed_amount))}
              </span>
            </div>
          )}
          {proposal.original_amount != null && proposal.proposed_amount != null && (
            <div className="flex justify-between">
              <span className="text-sand-400">ลดได้</span>
              <span className="text-clay-600 font-bold">
                {formatCurrency(Number(proposal.original_amount) - Number(proposal.proposed_amount))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Conditions */}
      {proposal.conditions && (
        <div className="mt-2.5 p-2.5 bg-sand-100 rounded-lg">
          <p className="text-[11px] text-sand-400 mb-0.5">เงื่อนไข</p>
          <p className="text-xs text-ink-600">{proposal.conditions}</p>
        </div>
      )}

      {/* Status actions */}
      {(proposal.status === 'draft' || proposal.status === 'proposed') && (
        <div className="flex gap-2 mt-3 pt-2.5 border-t border-sand-200/50">
          {proposal.status === 'draft' && (
            <button
              onClick={() => onUpdateStatus(proposal.id, 'proposed')}
              className="flex-1 py-2 text-xs font-medium text-ceramic-600 bg-ceramic-500/10 rounded-lg hover:bg-ceramic-500/20 transition-colors"
            >
              📤 เสนอ
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(proposal.id, 'accepted')}
            className="flex-1 py-2 text-xs font-medium text-emerald-700 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            ✅ ยอมรับ
          </button>
          <button
            onClick={() => onUpdateStatus(proposal.id, 'rejected')}
            className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            ❌ ปฏิเสธ
          </button>
        </div>
      )}
    </Card>
  );
}
