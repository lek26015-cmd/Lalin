import type { DebtStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'active' | 'paused' | 'paid' | 'income' | 'expense';
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-sand-200 text-ink-600',
  active: 'bg-clay-500/15 text-clay-600',
  paused: 'bg-sand-300/40 text-ink-600',
  paid: 'bg-emerald-500/15 text-emerald-700',
  income: 'bg-bronze-500/15 text-bronze-600',
  expense: 'bg-clay-500/15 text-clay-600',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function DebtStatusBadge({ status }: { status: DebtStatus }) {
  const labels: Record<DebtStatus, string> = {
    active: 'กำลังจ่าย',
    paused: 'พักไว้',
    paid: 'จ่ายครบ',
  };

  return <Badge variant={status}>{labels[status]}</Badge>;
}
