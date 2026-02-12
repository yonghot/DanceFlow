'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchProfile = useUserStore((s) => s.fetchProfile);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // 현재 세션 확인
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      }
      setIsLoading(false);
    });

    // 인증 상태 변경 감시
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        fetchProfile(sessionUser.id);
      } else {
        clearUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, clearUser]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    router.push('/login');
  }, [clearUser, router]);

  return { user, isLoading, signOut };
}
