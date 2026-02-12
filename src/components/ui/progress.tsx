import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  gradientVariant?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, gradientVariant = false, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary/50',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full transition-all relative overflow-hidden',
            gradientVariant ? 'gradient-primary' : 'bg-primary'
          )}
          style={{ width: `${clampedValue}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
