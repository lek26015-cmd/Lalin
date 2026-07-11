/* ============================================================
   Lalin — TypeScript Type Definitions
   ============================================================ */

// --- Database Row Types ---

export interface Profile {
  id: string;
  line_id: string;
  name: string | null;
  display_name: string | null;
  picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export type DebtStatus = 'active' | 'paused' | 'paid';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  monthly_payment: number;
  interest_rate: number;
  start_date: string;
  paid_installments: number; // งวดที่จ่ายก่อนใช้แอป
  status: DebtStatus;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note: string | null;
  debt_id: string | null;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  allocate_percent: number; // % of monthly income to auto-allocate
  created_at: string;
  updated_at: string;
}

// --- NPL Proposals ---

export type ProposalType = 'restructure' | 'haircut';
export type ProposalStatus = 'draft' | 'proposed' | 'accepted' | 'rejected';

export interface DebtProposal {
  id: string;
  debt_id: string;
  type: ProposalType;
  // Restructure fields
  new_monthly_payment: number | null;
  new_total_installments: number | null;
  new_interest_rate: number | null;
  // Haircut fields
  original_amount: number | null;
  proposed_amount: number | null;
  // Common
  conditions: string | null;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

// --- Call Logs ---

export type CallResult = 'connected' | 'no_answer' | 'callback' | 'meeting_set';

export interface DebtCallLog {
  id: string;
  debt_id: string;
  call_date: string;
  result: CallResult;
  notes: string | null;
  created_at: string;
}

// --- Interest Rate Tiers ---

export interface DebtInterestTier {
  id: string;
  debt_id: string;
  from_installment: number; // งวดเริ่มต้น
  to_installment: number | null; // งวดสุดท้าย (null = จนกว่าจะหมด)
  interest_rate: number; // % ต่อปี
  condition_note: string | null; // เงื่อนไขพิเศษ
  created_at: string;
}

export interface NewInterestTier {
  debt_id: string;
  from_installment: number;
  to_installment?: number;
  interest_rate: number;
  condition_note?: string;
}

// --- Monthly Payment Status ---

export type MonthlyPaymentStatus = 'paid' | 'overdue' | 'upcoming';

export interface MonthPayment {
  month: string; // YYYY-MM
  label: string;
  status: MonthlyPaymentStatus;
  amount: number; // amount paid that month (0 if overdue/upcoming)
}

// --- Form / Input Types ---

export interface NewTransaction {
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note?: string;
  debt_id?: string;
}

export interface NewDebt {
  name: string;
  total_amount: number;
  monthly_payment: number;
  interest_rate?: number;
  start_date?: string;
  paid_installments?: number;
}

export interface NewDebtProposal {
  debt_id: string;
  type: ProposalType;
  new_monthly_payment?: number;
  new_total_installments?: number;
  new_interest_rate?: number;
  original_amount?: number;
  proposed_amount?: number;
  conditions?: string;
}

export interface NewCallLog {
  debt_id: string;
  call_date: string;
  result: CallResult;
  notes?: string;
}

// --- Dashboard Computed Types ---

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  activeDebtMonthly: number;
  availableCash: number;
}

// --- LINE Profile ---

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// --- Category Config ---

export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
}
