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
        'sticky top-0 z-50 w-full glass-neon border-b border-neon-pink/10',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold"
          aria-label="DanceFlow 홈으로 이동"
        >
          <Music2 className="h-5 w-5 text-neon-pink animate-neon-pulse" aria-hidden="true" />
          <span className="neon-text-pink">DanceFlow</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/mypage"
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-neon-pink"
            aria-label="마이페이지"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          {user && (
            <button
              onClick={signOut}
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-neon-pink"
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
