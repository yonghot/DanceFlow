'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { BodyPartScore as BodyPartScoreType } from '@/types';

const BODY_PART_LABELS: Record<BodyPartScoreType['part'], string> = {
  leftArm: '\uC88C\uD314',
  rightArm: '\uC6B0\uD314',
  torso: '\uC0C1\uCCB4',
  leftLeg: '\uC88C\uB2E4\uB9AC',
  rightLeg: '\uC6B0\uB2E4\uB9AC',
};

export interface BodyPartScoreProps {
  scores: BodyPartScoreType[];
  className?: string;
}

function BodyPartScoreDisplay({ scores, className }: BodyPartScoreProps) {
  const minScore = Math.min(...scores.map((s) => s.score));

  return (
    <div className={cn('flex flex-col gap-4', className)} role="list" aria-label="신체 부위별 점수">
      {scores.map((item) => {
        const isLowest = item.score === minScore;

        return (
          <div
            key={item.part}
            className="flex flex-col gap-1.5"
            role="listitem"
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'text-sm font-medium',
                  isLowest
                    ? 'text-destructive'
                    : 'text-foreground'
                )}
              >
                {BODY_PART_LABELS[item.part]}
              </span>
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  isLowest
                    ? 'text-destructive'
                    : 'text-foreground'
                )}
              >
                {item.score}
              </span>
            </div>
            <Progress
              value={item.score}
              gradientVariant={!isLowest}
              className={cn('h-2', isLowest && '[&>div]:bg-destructive')}
            />
            <p
              className={cn(
                'text-xs',
                isLowest
                  ? 'text-destructive/80'
                  : 'text-muted-foreground'
              )}
            >
              {item.feedback}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export { BodyPartScoreDisplay };
