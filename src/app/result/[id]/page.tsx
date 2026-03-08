'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreDisplay } from '@/components/score/ScoreDisplay';
import { GradeIndicator } from '@/components/score/GradeIndicator';
import { BodyPartScoreDisplay } from '@/components/score/BodyPartScore';
import { GradeMessage } from '@/components/result/GradeMessage';
import { ParticleBackground } from '@/components/result/ParticleBackground';
import { usePracticeStore } from '@/stores/practiceStore';

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function ResultPage() {
  const router = useRouter();
  const {
    currentScore,
    currentGrade,
    accuracyScore,
    timingScore,
    bodyPartScores,
    selectedChoreography,
  } = usePracticeStore();

  useEffect(() => {
    if (!currentGrade || !selectedChoreography) {
      router.replace('/');
    }
  }, [currentGrade, selectedChoreography, router]);

  if (!currentGrade || !selectedChoreography) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-grid">
      <ParticleBackground grade={currentGrade} />

      <div className="relative z-10 section-container py-10 sm:py-16 max-w-lg mx-auto">
        {/* Song Info */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-center mb-10"
        >
          <p className="text-sm text-muted-foreground mb-1">
            {selectedChoreography.artist}
          </p>
          <h1 className="text-heading font-bold neon-text-pink">
            {selectedChoreography.title}
          </h1>
        </motion.div>

        {/* Score + Grade */}
        <motion.div
          custom={0.15}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-center mb-10"
        >
          <ScoreDisplay score={currentScore} animate />
          <div className="mt-6">
            <GradeIndicator grade={currentGrade} size="lg" />
          </div>
          <GradeMessage grade={currentGrade} />
        </motion.div>

        {/* Score Details */}
        {accuracyScore !== null && timingScore !== null && (
          <motion.div
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Card className="mb-6 glass border-white/5 rounded-xl shadow-premium">
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-bold mb-6 text-center text-heading-sm">점수 상세</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center glass rounded-xl p-5">
                    <p className="text-4xl font-extrabold neon-text-pink">{accuracyScore}</p>
                    <p className="text-xs text-muted-foreground mt-2">동작 정확도</p>
                  </div>
                  <div className="text-center glass rounded-xl p-5">
                    <p className="text-4xl font-extrabold neon-text-cyan">{timingScore}</p>
                    <p className="text-xs text-muted-foreground mt-2">박자 일치도</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Body Part Scores */}
        {bodyPartScores.length > 0 && (
          <motion.div
            custom={0.45}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <Card className="mb-8 glass border-white/5 rounded-xl shadow-premium">
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-bold mb-6 text-heading-sm">부위별 분석</h2>
                <BodyPartScoreDisplay scores={bodyPartScores} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          custom={0.6}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="flex gap-3"
        >
          <Button
            onClick={() =>
              router.push(`/practice/${selectedChoreography.id}`)
            }
            variant="gradient"
            className="flex-1 shadow-neon-pink"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            다시 연습
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="lg"
            className="border-white/10"
          >
            <Home className="h-4 w-4 mr-2" />
            홈
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
