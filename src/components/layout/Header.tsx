'use client';

import Link from 'next/link';
import { User, LogOut, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export interface HeaderProps {
  className?: string;
}

function Header({ className }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-white/5',
        className
      )}
      style={{
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="section-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold group"
          aria-label="DanceFlow 홈으로 이동"
        >
          <Music2
            className="h-6 w-6 text-neon-pink animate-neon-pulse group-hover:scale-110 transition-transform"
            aria-hidden="true"
          />
          <span className="neon-text-pink tracking-tight">DanceFlow</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/mypage"
            className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:text-neon-pink hover:bg-white/5"
            aria-label="마이페이지"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          {user && (
            <button
              onClick={signOut}
              className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:text-neon-pink hover:bg-white/5"
              aria-label="로그아웃"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };
