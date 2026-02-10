import Link from 'next/link';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  className?: string;
}

function Header({ className }: HeaderProps) {
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
        <Link
          href="/mypage"
          className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="마이페이지"
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

export { Header };
