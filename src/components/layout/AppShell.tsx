'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { useAuth } from '@/hooks/useAuth';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 인증/설정 관련 페이지는 chrome 없이 렌더링
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/setup';
  const isImmersivePage = pathname.startsWith('/practice') || pathname.startsWith('/reference');
  const showChrome = !isAuthPage && !isImmersivePage;

  if (!isHydrated || isLoading) {
    return <div className="min-h-screen bg-background bg-grid" />;
  }

  if (showChrome) {
    return (
      <div className="min-h-screen bg-grid">
        <Header />
        <main className="pb-16">{children}</main>
        <Navigation />
      </div>
    );
  }

  return <>{children}</>;
}
