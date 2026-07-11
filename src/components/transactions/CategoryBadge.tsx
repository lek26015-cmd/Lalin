import { getCategoryConfig } from '@/lib/categories';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const config = getCategoryConfig(category);

  return (
    <span
      className={`inline-flex items-center gap-1 ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      } rounded-full bg-sand-200/60 text-ink-600 font-medium`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
