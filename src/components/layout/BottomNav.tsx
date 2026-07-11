'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'หน้าหลัก', icon: '📊', activeIcon: '📊' },
  { href: '/debts', label: 'หนี้สิน', icon: '💳', activeIcon: '💳' },
  { href: '/transactions', label: 'ประวัติ', icon: '📋', activeIcon: '📋' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-sand-200/60">
      <div className="flex items-stretch justify-around px-2" style={{ paddingBottom: 'var(--sab, 0px)' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 px-4 min-w-[64px] transition-colors touch-active ${
                isActive ? 'text-clay-600' : 'text-sand-400'
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className={`text-[10px] font-medium leading-tight ${
                  isActive ? 'text-clay-600' : 'text-sand-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-[var(--sab,0px)] w-8 h-0.5 bg-clay-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
