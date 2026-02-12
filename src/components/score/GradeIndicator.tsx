'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Grade } from '@/types';

const GRADE_DISPLAY: Record<Grade, { label: string; color: string; glow: string }> = {
  perfect: { label: '\uD37C\uD399\uD2B8', color: '#FFD700', glow: 'rgba(255,215,0,0.5)' },
  great: { label: '\uD6CC\uB96D\uD574\uC694', color: '#FF2D78', glow: 'rgba(255,45,120,0.5)' },
  good: { label: '\uC88B\uC544\uC694', color: '#00F0FF', glow: 'rgba(0,240,255,0.4)' },
  ok: { label: '\uAD1C\uCC2E\uC544\uC694', color: '#64748B', glow: 'transparent' },
  miss: { label: '\uB2E4\uC2DC \uB3C4\uC804', color: '#FF3355', glow: 'transparent' },
};

const SIZE_CLASSES = {
  sm: 'text-lg px-3 py-1',
  md: 'text-2xl px-5 py-2',
  lg: 'text-4xl px-8 py-3',
} as const;

export interface GradeIndicatorProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function GradeIndicator({
  grade,
  size = 'md',
  className,
}: GradeIndicatorProps) {
  const { label, color, glow } = GRADE_DISPLAY[grade];
  const shouldGlow = grade === 'perfect' || grade === 'great';
  const isRainbow = grade === 'perfect';

  return (
    <motion.div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold',
        SIZE_CLASSES[size],
        shouldGlow && 'animate-grade-glow',
        isRainbow && 'animate-rainbow-shift',
        className
      )}
      style={{
        color,
        textShadow: `0 0 10px ${glow}, 0 0 30px ${glow}`,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      transition={{ duration: 0.5, times: [0, 0.6, 1], ease: 'easeOut' }}
      role="status"
      aria-label={`${label}`}
    >
      {label}
    </motion.div>
  );
}

export { GradeIndicator };
