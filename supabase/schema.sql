-- ============================================================
-- Lalin — LINE Mini App for Debt Management & Finance Tracking
-- Supabase Schema Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles: linked to LINE user identity
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id TEXT UNIQUE NOT NULL,
  name TEXT,
  display_name TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Debts: individual debt records
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  monthly_payment NUMERIC(12,2) NOT NULL DEFAULT 0,
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'paid')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions: income/expense log
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  debt_id UUID REFERENCES debts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Savings Goals: for Haircut Fund and others
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Haircut Fund',
  target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  allocate_percent NUMERIC(5,2) NOT NULL DEFAULT 10, -- % of monthly income
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Debt Proposals: restructuring & haircut proposals per debt
CREATE TABLE IF NOT EXISTS debt_proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restructure', 'haircut')),
  -- Restructure fields
  new_monthly_payment NUMERIC(12,2),
  new_total_installments INTEGER,
  new_interest_rate NUMERIC(5,2),
  -- Haircut fields
  original_amount NUMERIC(12,2),
  proposed_amount NUMERIC(12,2),
  -- Common
  conditions TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'proposed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Debt Call Logs: track creditor calls per debt
CREATE TABLE IF NOT EXISTS debt_call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE NOT NULL,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  result TEXT NOT NULL DEFAULT 'connected'
    CHECK (result IN ('connected', 'no_answer', 'callback', 'meeting_set')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Debt Interest Tiers: tiered interest rates per debt
CREATE TABLE IF NOT EXISTS debt_interest_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE NOT NULL,
  from_installment INTEGER NOT NULL DEFAULT 1,
  to_installment INTEGER, -- NULL = until end
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  condition_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_debt ON transactions(debt_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_debt ON debt_proposals(debt_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_debt ON debt_call_logs(debt_id, call_date DESC);
CREATE INDEX IF NOT EXISTS idx_interest_tiers_debt ON debt_interest_tiers(debt_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_interest_tiers ENABLE ROW LEVEL SECURITY;

-- Permissive policies for MVP (app-layer filtering by user_id)
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on debts" ON debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on savings_goals" ON savings_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on debt_proposals" ON debt_proposals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on debt_call_logs" ON debt_call_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on debt_interest_tiers" ON debt_interest_tiers FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE debts;
ALTER PUBLICATION supabase_realtime ADD TABLE savings_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE debt_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE debt_call_logs;

-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON debt_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. MIGRATION (for existing databases)
-- ============================================================
-- Run these separately if your database already has the old schema:
--
-- ALTER TABLE debts ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
-- ALTER TABLE debts ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;
