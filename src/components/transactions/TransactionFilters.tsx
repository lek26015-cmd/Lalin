'use client';

interface TransactionFiltersProps {
  activeFilter: 'all' | 'income' | 'expense';
  onFilterChange: (filter: 'all' | 'income' | 'expense') => void;
}

const FILTERS = [
  { key: 'all' as const, label: 'ทั้งหมด', icon: '📋' },
  { key: 'income' as const, label: 'รายรับ', icon: '📈' },
  { key: 'expense' as const, label: 'รายจ่าย', icon: '📉' },
];

export function TransactionFilters({ activeFilter, onFilterChange }: TransactionFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {FILTERS.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            activeFilter === filter.key
              ? 'bg-clay-500 text-white shadow-sm'
              : 'bg-sand-100 text-ink-600 border border-sand-200'
          }`}
        >
          <span className="text-sm">{filter.icon}</span>
          {filter.label}
        </button>
      ))}
    </div>
  );
}
