'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ComboCounterProps {
  combo: number;
}

function ComboCounter({ combo }: ComboCounterProps) {
  if (combo < 3) return null;

  const isHighCombo = combo >= 10;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute top-20 right-4 z-30 flex flex-col items-end pointer-events-none"
      >
        <motion.span
          key={combo}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="text-5xl font-extrabold tabular-nums"
          style={{
            background: isHighCombo
              ? 'linear-gradient(135deg, #FF2D78, #00F0FF)'
              : undefined,
            WebkitBackgroundClip: isHighCombo ? 'text' : undefined,
            WebkitTextFillColor: isHighCombo ? 'transparent' : '#00F0FF',
            filter: isHighCombo
              ? 'drop-shadow(0 0 20px rgba(255,45,120,0.6))'
              : 'drop-shadow(0 0 10px rgba(0,240,255,0.4))',
          }}
        >
          {combo}
        </motion.span>
        <span className="text-sm font-bold text-white/80 tracking-wider">
          COMBO
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

export { ComboCounter };
