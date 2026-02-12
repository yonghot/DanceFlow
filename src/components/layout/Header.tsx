'use client';

import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
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
        'sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold text-gradient-primary"
          aria-label="DanceFlow 홈으로 이동"
        >
          DanceFlow
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/mypage"
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="마이페이지"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
          {user && (
            <button
              onClick={signOut}
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
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
