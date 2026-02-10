'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScoreDisplayProps {
  score: number;
  animate?: boolean;
  className?: string;
}

function ScoreDisplay({ score, animate = false, className }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    setDisplayScore(0);
    const duration = 1500;
    const frameRate = 60;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(eased * score);

      setDisplayScore(currentScore);

      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setDisplayScore(score);
      }
    }, duration / totalFrames);

    return () => clearInterval(timer);
  }, [score, animate]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {animate ? (
        <motion.span
          className="text-7xl font-extrabold text-gradient-primary"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-live="polite"
          aria-label={`${score}`}
        >
          {displayScore}
        </motion.span>
      ) : (
        <span
          className="text-7xl font-extrabold text-gradient-primary"
          aria-label={`${score}`}
        >
          {displayScore}
        </span>
      )}
    </div>
  );
}

export { ScoreDisplay };
