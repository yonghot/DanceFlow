'use client';

import { motion } from 'framer-motion';
import type { Grade } from '@/types';

const GRADE_MESSAGES: Record<Grade, { title: string; message: string }> = {
  perfect: {
    title: '완벽합니다!',
    message: '당신은 진정한 댄스 마스터!',
  },
  great: {
    title: '훌륭해요!',
    message: '조금만 더 연습하면 완벽해질 거예요!',
  },
  good: {
    title: '좋아요!',
    message: '기본기가 탄탄하네요. 계속 연습하세요!',
  },
  ok: {
    title: '괜찮아요!',
    message: '좋은 시작이에요. 조금씩 나아지고 있어요!',
  },
  miss: {
    title: '다시 도전!',
    message: '포기하지 마세요. 연습이 완벽을 만듭니다!',
  },
};

interface GradeMessageProps {
  grade: Grade;
}

function GradeMessage({ grade }: GradeMessageProps) {
  const { title, message } = GRADE_MESSAGES[grade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="text-center mt-4 mb-6"
    >
      <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );
}

export { GradeMessage };
