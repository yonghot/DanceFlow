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
  { label: '\uD648', href: '/', icon: Home },
  { label: '\uC5F0\uC2B5', href: '/practice', icon: Play, disabled: true },
  { label: '\uB9C8\uC774', href: '/mypage', icon: User },
];

export interface NavigationProps {
  className?: string;
}

function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm',
        className
      )}
      aria-label="메인 내비게이션"
    >
      <ul className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <li key={item.href}>
                <span
                  className="flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground/50"
                  aria-disabled="true"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs">{item.label}</span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { Navigation };
