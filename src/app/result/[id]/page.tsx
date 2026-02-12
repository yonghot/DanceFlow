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
    <div className="relative px-4 py-8 max-w-lg mx-auto">
      <ParticleBackground grade={currentGrade} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-8"
      >
        <p className="text-sm text-muted-foreground mb-1">
          {selectedChoreography.artist}
        </p>
        <h1 className="text-xl font-semibold mb-8">
          {selectedChoreography.title}
        </h1>

        <ScoreDisplay score={currentScore} animate />

        <div className="mt-6">
          <GradeIndicator grade={currentGrade} size="lg" />
        </div>

        <GradeMessage grade={currentGrade} />
      </motion.div>

      {accuracyScore !== null && timingScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">점수 상세</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{accuracyScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">동작 정확도</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{timingScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">박자 일치도</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {bodyPartScores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">부위별 분석</h2>
              <BodyPartScoreDisplay scores={bodyPartScores} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        <Button
          onClick={() =>
            router.push(`/practice/${selectedChoreography.id}`)
          }
          variant="gradient"
          className="flex-1"
          size="lg"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          다시 연습
        </Button>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          size="lg"
        >
          <Home className="h-4 w-4 mr-2" />
          홈
        </Button>
      </motion.div>
    </div>
  );
}
