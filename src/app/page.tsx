'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AvailableCash } from '@/components/dashboard/AvailableCash';
import { HaircutFund } from '@/components/dashboard/HaircutFund';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { FloatingAddButton } from '@/components/entry/FloatingAddButton';
import { DailyBudget } from '@/components/dashboard/DailyBudget';
import { useProfile } from '@/hooks/useProfile';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { isLoading, isLoggedIn } = useProfile();

  if (isLoading) {
    return (
      <AppShell>
        <PageLoading />
      </AppShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="text-center px-6">
            <span className="text-5xl mb-4 block">🔐</span>
            <h2 className="text-lg font-semibold text-ink-800 mb-2 font-[var(--font-display)]">
              ต้องเข้าสู่ระบบ
            </h2>
            <p className="text-sm text-sand-400">
              กรุณาเปิดแอปนี้ผ่าน LINE เพื่อเข้าใช้งาน
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 py-4 space-y-5">
        {/* Hero: Available Cash */}
        <AvailableCash />

        {/* Daily Budget */}
        <DailyBudget />

        {/* Haircut Fund */}
        <HaircutFund />

        {/* Monthly Stats */}
        <QuickStats />

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>

      {/* FAB */}
      <FloatingAddButton />
    </AppShell>
  );
}
