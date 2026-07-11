'use client';

import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-sand-50">
      <Header />

      {/* Main content with bottom nav spacing */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
