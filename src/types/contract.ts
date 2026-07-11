/**
 * Contract Analysis Types — ข้อมูลที่ AI ดึงจากสัญญา
 */

export interface ContractAnalysisResult {
  debt_name: string;
  total_amount: number;
  monthly_payment: number;
  minimum_payment: number | null;
  interest_tiers: {
    from_installment: number;
    to_installment: number | null;
    interest_rate: number;
    condition_note: string | null;
  }[];
  default_interest_rate: number;
  start_date: string | null;
  paid_installments: number | null;
  special_conditions: string[];
  contract_type: string;
  creditor_name: string | null;
  raw_summary: string;
}
