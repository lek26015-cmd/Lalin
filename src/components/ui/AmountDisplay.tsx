'use client';

import { formatCurrency } from '@/lib/formatters';

interface AmountDisplayProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-semibold',
  xl: 'text-3xl font-bold font-[var(--font-display)]',
};

export function AmountDisplay({
  amount,
  type = 'neutral',
  size = 'md',
  showSign = false,
  className = '',
}: AmountDisplayProps) {
  const colorMap = {
    income: 'text-bronze-500',
    expense: 'text-clay-600',
    neutral: 'text-ink-800',
  };

  const sign = showSign ? (type === 'income' ? '+' : type === 'expense' ? '-' : '') : '';

  return (
    <span
      className={`${sizeStyles[size]} ${colorMap[type]} tabular-nums tracking-tight ${className}`}
    >
      {sign}
      {formatCurrency(Math.abs(amount))}
    </span>
  );
}
