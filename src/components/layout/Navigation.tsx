'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Play, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: '홈', href: '/', icon: Home },
  { label: '연습', href: '/practice', icon: Play, disabled: true },
  { label: '마이', href: '/mypage', icon: User },
];

export interface NavigationProps {
  className?: string;
}

function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-white/5',
        className
      )}
      style={{
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      aria-label="메인 내비게이션"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-pink/30 to-transparent" />
      <ul className="flex items-center justify-around py-2 pb-safe max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <li key={item.href}>
                <span
                  className="flex flex-col items-center gap-1 px-4 py-1.5 text-muted-foreground/40"
                  aria-disabled="true"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-4 py-1.5 transition-all duration-200',
                  isActive
                    ? 'text-neon-pink'
                    : 'text-muted-foreground hover:text-neon-pink'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} aria-hidden="true" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 h-0.5 w-6 rounded-full gradient-primary shadow-neon-pink" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { Navigation };
