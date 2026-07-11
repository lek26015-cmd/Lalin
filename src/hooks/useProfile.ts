'use client';

import { useLiff } from '@/context/LiffContext';

export function useProfile() {
  const { profile, lineProfile, isLoading, isLoggedIn, liffError } = useLiff();

  return {
    profile,
    lineProfile,
    isLoading,
    isLoggedIn,
    error: liffError,
    userId: profile?.id ?? lineProfile?.userId ?? null,
  };
}
