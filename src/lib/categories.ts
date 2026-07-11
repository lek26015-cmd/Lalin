import type { CategoryConfig } from '@/types';

export const INCOME_CATEGORIES: Record<string, CategoryConfig> = {
  Salary: { label: 'เงินเดือน', icon: '💰', color: 'bg-bronze-500' },
  Freelance: { label: 'ฟรีแลนซ์', icon: '💻', color: 'bg-bronze-400' },
  'Other Income': { label: 'รายได้อื่น', icon: '📥', color: 'bg-bronze-600' },
};

export const EXPENSE_CATEGORIES: Record<string, CategoryConfig> = {
  Food: { label: 'อาหาร', icon: '🍜', color: 'bg-clay-500' },
  Fuel: { label: 'น้ำมัน', icon: '⛽', color: 'bg-clay-600' },
  Transport: { label: 'เดินทาง', icon: '🛵', color: 'bg-ceramic-500' },
  Bills: { label: 'ค่าบิล', icon: '📄', color: 'bg-ceramic-600' },
  Shopping: { label: 'ช้อปปิ้ง', icon: '🛒', color: 'bg-clay-400' },
  Other: { label: 'อื่นๆ', icon: '📦', color: 'bg-sand-400' },
};

export const DEBT_PAYMENT_CATEGORY = {
  'Debt Payment': { label: 'จ่ายหนี้', icon: '💳', color: 'bg-clay-700' },
};

export const ALL_CATEGORIES: Record<string, CategoryConfig> = {
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
  ...DEBT_PAYMENT_CATEGORY,
};

export function getCategoryConfig(category: string): CategoryConfig {
  return ALL_CATEGORIES[category] ?? { label: category, icon: '📋', color: 'bg-sand-300' };
}

export function getCategoriesForType(type: 'income' | 'expense' | 'debtPayment') {
  switch (type) {
    case 'income':
      return INCOME_CATEGORIES;
    case 'expense':
      return EXPENSE_CATEGORIES;
    case 'debtPayment':
      return DEBT_PAYMENT_CATEGORY;
  }
}
