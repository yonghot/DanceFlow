'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { useUserStore } from '@/stores/userStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnboarded = useUserStore((s) => s.isOnboarded);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isOnboardingPage = pathname === '/onboarding';
  const isImmersivePage = pathname.startsWith('/practice');
  const showChrome = !isOnboardingPage && !isImmersivePage;

  useEffect(() => {
    if (isHydrated && !isOnboarded && !isOnboardingPage) {
      router.replace('/onboarding');
    }
  }, [isHydrated, isOnboarded, isOnboardingPage, router]);

  if (!isHydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (showChrome) {
    return (
      <>
        <Header />
        <main className="pb-16">{children}</main>
        <Navigation />
      </>
    );
  }

  return <>{children}</>;
}
