'use client';

import Image from 'next/image';
import { useProfile } from '@/hooks/useProfile';

export function Header() {
  const { lineProfile, isLoading } = useProfile();

  return (
    <header className="sticky top-0 z-30 glass-strong">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-clay-500 to-clay-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold font-[var(--font-display)]">L</span>
          </div>
          <h1 className="text-lg font-bold text-ink-900 font-[var(--font-display)] tracking-tight">
            Lalin
          </h1>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full skeleton" />
          ) : (
            <>
              <span className="text-sm text-ink-600 font-medium hidden min-[360px]:block">
                {lineProfile?.displayName ?? 'User'}
              </span>
              {lineProfile?.pictureUrl ? (
                <Image
                  src={lineProfile.pictureUrl}
                  alt={lineProfile.displayName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover ring-2 ring-sand-200"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ceramic-500 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {lineProfile?.displayName?.[0] ?? 'U'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
