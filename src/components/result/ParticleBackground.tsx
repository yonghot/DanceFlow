'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Grade } from '@/types';

interface ParticleBackgroundProps {
  grade: Grade;
}

interface Particle {
  id: number;
  delay: number;
  duration: number;
  startX: number;
  drift: number;
  size: number;
}

function ParticleBackground({ grade }: ParticleBackgroundProps) {
  const particles = useMemo((): Particle[] => {
    if (grade !== 'perfect' && grade !== 'great') return [];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 3,
      startX: Math.random() * 100,
      drift: (Math.random() - 0.5) * 30,
      size: 4 + Math.random() * 6,
    }));
  }, [grade]);

  if (particles.length === 0) return null;

  const gradient =
    grade === 'perfect'
      ? 'linear-gradient(135deg, #FFD700, #FFA500)'
      : 'linear-gradient(135deg, #FF2D78, #00F0FF)';

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.startX}%`,
            width: p.size,
            height: p.size,
            background: gradient,
          }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{
            y: '-10vh',
            x: [0, p.drift, 0],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export { ParticleBackground };
