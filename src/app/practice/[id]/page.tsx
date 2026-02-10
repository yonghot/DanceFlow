'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { usePracticeStore } from '@/stores/practiceStore';
import { useUserStore } from '@/stores/userStore';
import { useScore } from '@/hooks/useScore';
import { getChoreographyById } from '@/lib/data/choreographies';
import { savePracticeRecord } from '@/lib/db/practiceRepo';
import {
  JudgementPopup,
  type JudgementType,
} from '@/components/practice/JudgementPopup';
import { ComboCounter } from '@/components/practice/ComboCounter';
import {
  GRADE_THRESHOLDS,
  type PoseFrame,
  type PracticeRecord,
  type Grade,
  type BodyPartScore,
  type BodyPartType,
  type Landmark,
} from '@/types';

const BODY_PART_LANDMARK_INDICES: Record<BodyPartType, number[]> = {
  leftArm: [11, 13, 15],
  rightArm: [12, 14, 16],
  torso: [11, 12, 23, 24],
  leftLeg: [23, 25, 27],
  rightLeg: [24, 26, 28],
};

const SKELETON_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28],
];

function getGradeFromScore(score: number): Grade {
  if (score >= GRADE_THRESHOLDS.perfect.min) return 'perfect';
  if (score >= GRADE_THRESHOLDS.great.min) return 'great';
  if (score >= GRADE_THRESHOLDS.good.min) return 'good';
  if (score >= GRADE_THRESHOLDS.ok.min) return 'ok';
  return 'miss';
}

function getTrackingFeedback(score: number): string {
  if (score >= 90) return '움직임이 정확하게 감지되었습니다!';
  if (score >= 70) return '대체로 잘 감지되었습니다.';
  if (score >= 50) return '감지가 불안정합니다. 카메라 위치를 확인하세요.';
  return '이 부위가 잘 보이도록 카메라를 조정해주세요.';
}

function calculateCurrentQuality(landmarks: Landmark[]): number {
  const sum = landmarks.reduce((acc, lm) => acc + lm.visibility, 0);
  return Math.round((sum / landmarks.length) * 100);
}

function calculateTrackingQuality(poses: PoseFrame[]): {
  totalScore: number;
  grade: Grade;
  bodyPartScores: BodyPartScore[];
} {
  if (poses.length === 0) {
    return {
      totalScore: 0,
      grade: 'miss',
      bodyPartScores: (
        Object.keys(BODY_PART_LANDMARK_INDICES) as BodyPartType[]
      ).map((part) => ({
        part,
        score: 0,
        feedback: '포즈가 감지되지 않았습니다.',
      })),
    };
  }

  const partScores: BodyPartScore[] = (
    Object.keys(BODY_PART_LANDMARK_INDICES) as BodyPartType[]
  ).map((part) => {
    const indices = BODY_PART_LANDMARK_INDICES[part];
    let totalVis = 0;

    for (const frame of poses) {
      const partVis =
        indices.reduce(
          (sum, i) => sum + (frame.landmarks[i]?.visibility ?? 0),
          0
        ) / indices.length;
      totalVis += partVis;
    }

    const avgVis = totalVis / poses.length;
    const score = Math.min(100, Math.round(avgVis * 100));

    return { part, score, feedback: getTrackingFeedback(score) };
  });

  const totalScore = Math.round(
    partScores.reduce((sum, ps) => sum + ps.score, 0) / partScores.length
  );

  return {
    totalScore,
    grade: getGradeFromScore(totalScore),
    bodyPartScores: partScores,
  };
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const choreography = getChoreographyById(id);

  const {
    state: practiceState,
    setState: setPracticeState,
    setScore,
    setGrade,
    setBodyPartScores,
    setSelectedChoreography,
    reset: resetPractice,
  } = usePracticeStore();

  const {
    videoRef,
    isReady: isCameraReady,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  const {
    isDetecting,
    currentPose,
    fps,
    startDetection,
    stopDetection,
  } = usePoseDetection();

  const { calculateScore } = useScore();

  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(choreography?.duration ?? 30);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const posesRef = useRef<PoseFrame[]>([]);
  const practiceStateRef = useRef(practiceState);
  const isFinishingRef = useRef(false);

  // 게임 이펙트 상태
  const [currentQuality, setCurrentQuality] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [currentJudgement, setCurrentJudgement] = useState<JudgementType>(null);
  const [judgementTriggerId, setJudgementTriggerId] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const lastJudgementTimeRef = useRef(0);

  useEffect(() => {
    practiceStateRef.current = practiceState;
  }, [practiceState]);

  // 마운트 시 카메라 시작
  useEffect(() => {
    let isMounted = true;

    resetPractice();

    const init = async (): Promise<void> => {
      await startCamera();
    };

    if (isMounted) {
      init();
    }

    return () => {
      isMounted = false;
      stopCamera();
      stopDetection();
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 스켈레톤 오버레이 그리기 + 포즈 기록 + 게임 이펙트
  useEffect(() => {
    if (!currentPose || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 실시간 품질 계산
    const quality = practiceStateRef.current === 'practicing'
      ? calculateCurrentQuality(currentPose)
      : 0;

    // 품질 기반 동적 스켈레톤 렌더링
    const qualityFactor = quality / 100;
    const jointRadius = 5 + qualityFactor * 3;
    const lineWidth = 2 + qualityFactor * 2;
    const alpha = 0.6 + qualityFactor * 0.4;

    // 글로우 효과 (품질 80+ 시)
    if (quality >= 80) {
      ctx.shadowBlur = 12 + qualityFactor * 8;
      ctx.shadowColor = '#7C3AED';
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`;
    for (const lm of currentPose) {
      if (lm.visibility < 0.5) continue;
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, jointRadius, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.shadowColor = '#06B6D4';
    ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
    ctx.lineWidth = lineWidth;
    for (const [i, j] of SKELETON_CONNECTIONS) {
      const a = currentPose[i];
      const b = currentPose[j];
      if (!a || !b || a.visibility < 0.5 || b.visibility < 0.5) continue;
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    if (practiceStateRef.current === 'practicing') {
      setCurrentQuality(quality);

      // 콤보 업데이트
      if (quality >= 75) {
        setComboCount((prev) => prev + 1);
      } else if (quality < 60) {
        setComboCount(0);
      }

      // 판정 트리거 (0.5초 쿨다운)
      const now = performance.now();
      if (now - lastJudgementTimeRef.current > 500) {
        let judgement: JudgementType = null;

        if (quality >= 95) judgement = 'perfect';
        else if (quality >= 85) judgement = 'great';
        else if (quality >= 75) judgement = 'good';

        if (judgement) {
          setCurrentJudgement(judgement);
          setJudgementTriggerId((prev) => prev + 1);
          lastJudgementTimeRef.current = now;

          // 플래시 이펙트 (perfect/great)
          if (judgement === 'perfect' || judgement === 'great') {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 150);
          }

          setTimeout(() => setCurrentJudgement(null), 800);
        }
      }

      // 포즈 기록
      posesRef.current.push({
        timestamp: performance.now(),
        landmarks: currentPose.map((lm) => ({ ...lm })),
      });
    }
  }, [currentPose]); // eslint-disable-line react-hooks/exhaustive-deps

  // 타이머 종료 감지
  useEffect(() => {
    if (
      timeLeft <= 0 &&
      practiceState === 'practicing' &&
      !isFinishingRef.current
    ) {
      isFinishingRef.current = true;
      finishPractice();
    }
  }, [timeLeft, practiceState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(() => {
    setPracticeState('countdown');
    let count = 3;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setPracticeState('practicing');

        if (videoRef.current) {
          startDetection(videoRef.current);
        }

        let remaining = choreography?.duration ?? 30;
        setTimeLeft(remaining);
        timerRef.current = setInterval(() => {
          remaining--;
          setTimeLeft(remaining);
          if (remaining <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
          }
        }, 1000);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [choreography, setPracticeState, startDetection, videoRef]);

  const finishPractice = async (): Promise<void> => {
    stopDetection();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPracticeState('completed');

    const poses = posesRef.current;
    const choreo = choreography!;
    const user = useUserStore.getState().user;

    let totalScore: number;
    let grade: Grade;
    let bodyPartScores: BodyPartScore[];

    if (choreo.referencePoses.length > 0) {
      const result = calculateScore(poses, choreo.referencePoses);
      totalScore = result.totalScore;
      grade = result.grade;
      bodyPartScores = result.bodyPartScores;
    } else {
      const result = calculateTrackingQuality(poses);
      totalScore = result.totalScore;
      grade = result.grade;
      bodyPartScores = result.bodyPartScores;
      setScore(totalScore);
      setGrade(grade);
      setBodyPartScores(bodyPartScores);
    }

    setSelectedChoreography(choreo);

    if (user) {
      const record: PracticeRecord = {
        id: crypto.randomUUID(),
        userId: user.id,
        choreographyId: choreo.id,
        totalScore,
        grade,
        bodyPartScores,
        duration: choreo.duration,
        practicedAt: new Date(),
      };
      await savePracticeRecord(record);
    }

    router.push(`/result/${choreo.id}`);
  };

  if (!choreography) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">안무를 찾을 수 없습니다</p>
        <Button onClick={() => router.push('/')} variant="outline">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  // 화면 테두리 글로우 (품질 기반)
  const borderGlow =
    practiceState === 'practicing' && currentQuality >= 80
      ? `inset 0 0 60px rgba(124, 58, 237, ${(currentQuality - 80) * 0.02}), inset 0 0 120px rgba(124, 58, 237, ${(currentQuality - 80) * 0.01})`
      : 'none';

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-30 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        aria-label="뒤로 가기"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* FPS 표시 */}
      {isDetecting && (
        <div className="absolute top-4 right-4 z-30 rounded bg-black/50 px-2 py-1 text-xs text-white/70">
          {fps} FPS
        </div>
      )}

      {/* 플래시 이펙트 */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 80px rgba(124, 58, 237, 0.5), inset 0 0 160px rgba(124, 58, 237, 0.2)',
            }}
          />
        )}
      </AnimatePresence>

      {/* 비디오 + 스켈레톤 */}
      <div
        className="relative h-full w-full transition-shadow duration-300"
        style={{ boxShadow: borderGlow }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* 게임 이펙트 오버레이 (연습 중) */}
      {practiceState === 'practicing' && (
        <>
          <JudgementPopup
            judgement={currentJudgement}
            triggerId={judgementTriggerId}
          />
          <ComboCounter combo={comboCount} />
        </>
      )}

      {/* 상태별 오버레이 */}
      <AnimatePresence mode="wait">
        {practiceState === 'idle' && !isCameraReady && !cameraError && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-white/70">카메라 준비 중...</p>
          </motion.div>
        )}

        {cameraError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black px-8"
          >
            <Camera className="h-12 w-12 text-destructive mb-4" />
            <p className="text-white mb-2 text-center">{cameraError}</p>
            <Button onClick={() => router.back()} variant="outline" className="mt-4">
              돌아가기
            </Button>
          </motion.div>
        )}

        {practiceState === 'idle' && isCameraReady && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              {choreography.title}
            </h2>
            <p className="text-white/70 mb-8">
              {choreography.artist} · {choreography.duration}초
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              variant="gradient"
              className="rounded-full px-8 py-6 text-lg"
            >
              시작하기
            </Button>
          </motion.div>
        )}

        {practiceState === 'countdown' && (
          <motion.div
            key="countdown"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-8xl font-extrabold text-white"
              >
                {countdown}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}

        {practiceState === 'practicing' && (
          <motion.div
            key="practicing"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/60 px-6 py-2"
          >
            <span className="text-2xl font-bold tabular-nums text-white">
              {timeLeft}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 프로그레스 바 (연습 중) */}
      {practiceState === 'practicing' && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1.5 bg-white/10">
          <motion.div
            className="h-full gradient-primary"
            style={{
              width: `${((choreography.duration - timeLeft) / choreography.duration) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
