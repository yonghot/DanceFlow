import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        perfect:
          'bg-neon-gold/15 text-neon-gold border-neon-gold/30 shadow-neon-gold',
        great: 'bg-neon-pink/15 text-neon-pink border-neon-pink/30 shadow-neon-pink',
        good: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30 shadow-neon-cyan',
        ok: 'bg-grade-ok/20 text-grade-ok border-grade-ok/30',
        miss: 'bg-neon-red/15 text-neon-red border-neon-red/30',
        beginner: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
        intermediate: 'bg-neon-pink/15 text-neon-pink border-neon-pink/30',
        advanced: 'bg-neon-gold/15 text-neon-gold border-neon-gold/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
