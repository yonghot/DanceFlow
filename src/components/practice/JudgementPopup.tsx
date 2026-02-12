'use client';

import { motion, AnimatePresence } from 'framer-motion';

type JudgementType = 'perfect' | 'great' | 'good' | null;

const JUDGEMENT_CONFIG: Record<
  Exclude<JudgementType, null>,
  { label: string; color: string }
> = {
  perfect: { label: 'PERFECT!', color: '#FFD700' },
  great: { label: 'GREAT!', color: '#FF2D78' },
  good: { label: 'GOOD!', color: '#00F0FF' },
};

interface JudgementPopupProps {
  judgement: JudgementType;
  triggerId: number;
}

function JudgementPopup({ judgement, triggerId }: JudgementPopupProps) {
  return (
    <AnimatePresence>
      {judgement && (
        <motion.div
          key={triggerId}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.3, 1],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 0.6, times: [0, 0.3, 0.6, 1] }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          style={{
            color: JUDGEMENT_CONFIG[judgement].color,
            textShadow: `0 0 30px ${JUDGEMENT_CONFIG[judgement].color}, 0 0 60px ${JUDGEMENT_CONFIG[judgement].color}40`,
          }}
        >
          <span className="text-5xl sm:text-6xl font-extrabold whitespace-nowrap">
            {JUDGEMENT_CONFIG[judgement].label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { JudgementPopup };
export type { JudgementType };
