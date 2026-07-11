'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import liff from '@line/liff';
import { createClient } from '@/lib/supabase/client';
import type { Profile, LineProfile } from '@/types';

interface LiffContextType {
  liffReady: boolean;
  liffError: string | null;
  isLoggedIn: boolean;
  lineProfile: LineProfile | null;
  profile: Profile | null;
  isLoading: boolean;
  logout: () => void;
}

const LiffContext = createContext<LiffContextType>({
  liffReady: false,
  liffError: null,
  isLoggedIn: false,
  lineProfile: null,
  profile: null,
  isLoading: true,
  logout: () => {},
});

export function LiffProvider({ children }: { children: ReactNode }) {
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const supabase = createClient();

  // Upsert profile to Supabase
  const upsertProfile = useCallback(
    async (lp: LineProfile) => {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('*')
          .eq('line_id', lp.userId)
          .single();

        if (existing) {
          if (
            existing.display_name !== lp.displayName ||
            existing.picture_url !== (lp.pictureUrl ?? null)
          ) {
            const { data: updated } = await supabase
              .from('profiles')
              .update({
                display_name: lp.displayName,
                picture_url: lp.pictureUrl ?? null,
              })
              .eq('line_id', lp.userId)
              .select()
              .single();
            return updated as Profile;
          }
          return existing as Profile;
        }

        const { data: created, error } = await supabase
          .from('profiles')
          .insert({
            line_id: lp.userId,
            name: lp.displayName,
            display_name: lp.displayName,
            picture_url: lp.pictureUrl ?? null,
          })
          .select()
          .single();

        if (error) throw error;
        return created as Profile;
      } catch (err) {
        console.error('Failed to upsert profile:', err);
        return null;
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId) {
      // Development fallback — no LIFF ID configured
      const mockLineProfile: LineProfile = {
        userId: 'dev-user-001',
        displayName: 'Dev User',
        pictureUrl: undefined,
      };

      // In dev mode, create a mock profile without hitting Supabase
      // (Supabase may have placeholder credentials that hang)
      const mockProfile: Profile = {
        id: 'dev-profile-001',
        line_id: 'dev-user-001',
        name: 'Dev User',
        display_name: 'Dev User',
        picture_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setLineProfile(mockLineProfile);
      setProfile(mockProfile);
      setLiffReady(true);
      setIsLoggedIn(true);
      setIsLoading(false);
      return;
    }

    const initLiff = async () => {
      try {
        await liff.init({ liffId });
        setLiffReady(true);

        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);

          const lp = await liff.getProfile();
          const lineProf: LineProfile = {
            userId: lp.userId,
            displayName: lp.displayName,
            pictureUrl: lp.pictureUrl,
          };
          setLineProfile(lineProf);

          const dbProfile = await upsertProfile(lineProf);
          if (dbProfile) {
            setProfile(dbProfile);
          } else {
            setProfile({
              id: lp.userId,
              line_id: lp.userId,
              name: lp.displayName,
              display_name: lp.displayName,
              picture_url: lp.pictureUrl ?? null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else if (liff.isInClient()) {
          // Inside LINE app but not logged in — try getting token
          try {
            const token = liff.getAccessToken();
            if (token) {
              setIsLoggedIn(true);
              const lp = await liff.getProfile();
              const lineProf: LineProfile = {
                userId: lp.userId,
                displayName: lp.displayName,
                pictureUrl: lp.pictureUrl,
              };
              setLineProfile(lineProf);
              setProfile({
                id: lp.userId,
                line_id: lp.userId,
                name: lp.displayName,
                display_name: lp.displayName,
                picture_url: lp.pictureUrl ?? null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          } catch {
            console.warn('Could not get profile in LINE client');
          }
        }
        // If not logged in and not in LINE client, just show the app
        // without login (guest mode) — no redirect!
      } catch (err) {
        const errObj = err as Error;
        console.error('LIFF init error:', errObj);
        setLiffError(errObj?.message || String(err) || 'LIFF init failed');
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, [upsertProfile]);

  const logout = useCallback(() => {
    if (liffReady && liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  }, [liffReady]);

  return (
    <LiffContext.Provider
      value={{
        liffReady,
        liffError,
        isLoggedIn,
        lineProfile,
        profile,
        isLoading,
        logout,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const ctx = useContext(LiffContext);
  if (!ctx) {
    throw new Error('useLiff must be used within LiffProvider');
  }
  return ctx;
}
