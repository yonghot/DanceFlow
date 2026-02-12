'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Camera, Upload, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useUserStore } from '@/stores/userStore';
import { getChoreographyById } from '@/lib/supabase/repos/choreographyRepo';
import { createReference } from '@/lib/supabase/repos/referenceRepo';
import { compactPoseFrames } from '@/lib/pose/compression';
import { uploadPoseData } from '@/lib/supabase/poseStorage';
import { RecordingPreview } from '@/components/reference/RecordingPreview';
import type { PoseFrame, Choreography, Landmark } from '@/types';

type RecordingState =
  | 'idle'
  | 'countdown'
  | 'recording'
  | 'preview'
  | 'uploading'
  | 'complete';

const SKELETON_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28],
];

export default function RecordReferencePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const choreographyId = params.choreographyId as string;
  const profile = useUserStore((s) => s.profile);

  const [choreography, setChoreography] = useState<Choreography | null>(null);
  const [isLoadingChoreo, setIsLoadingChoreo] = useState(true);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [recordedFrames, setRecordedFrames] = useState<PoseFrame[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const posesRef = useRef<PoseFrame[]>([]);
  const recordingStartRef = useRef<number>(0);
  const recordingStateRef = useRef(recordingState);

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

  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  // 안무 데이터 로딩
  useEffect(() => {
    async function loadChoreo(): Promise<void> {
      const data = await getChoreographyById(choreographyId);
      setChoreography(data);
      if (data) setTimeLeft(data.duration);
      setIsLoadingChoreo(false);
    }
    loadChoreo();
  }, [choreographyId]);

  // 마운트 시 카메라 시작
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopDetection();
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 스켈레톤 오버레이 + 포즈 기록
  useEffect(() => {
    if (!currentPose || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 관절점
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    for (const lm of currentPose) {
      if (lm.visibility < 0.5) continue;
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 6, 0, 2 * Math.PI);
      ctx.fill();
    }

    // 연결선
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
    ctx.lineWidth = 3;
    for (const [i, j] of SKELETON_CONNECTIONS) {
      const a = currentPose[i];
      const b = currentPose[j];
      if (!a || !b || a.visibility < 0.5 || b.visibility < 0.5) continue;
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    }

    // 녹화 중이면 프레임 기록 (상대 타임스탬프)
    if (recordingStateRef.current === 'recording') {
      const relativeTime = performance.now() - recordingStartRef.current;
      posesRef.current.push({
        timestamp: relativeTime,
        landmarks: currentPose.map((lm: Landmark) => ({ ...lm })),
      });
    }
  }, [currentPose]); // eslint-disable-line react-hooks/exhaustive-deps

  // 타이머 종료 감지
  useEffect(() => {
    if (timeLeft <= 0 && recordingState === 'recording') {
      finishRecording();
    }
  }, [timeLeft, recordingState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartRecording = useCallback((): void => {
    posesRef.current = [];
    setRecordingState('countdown');
    let count = 3;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);

        // 녹화 시작
        recordingStartRef.current = performance.now();
        setRecordingState('recording');

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
  }, [choreography, startDetection, videoRef]);

  const finishRecording = (): void => {
    stopDetection();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const frames = [...posesRef.current];
    setRecordedFrames(frames);
    setRecordingState('preview');
  };

  const handleReRecord = (): void => {
    setRecordedFrames([]);
    posesRef.current = [];
    setRecordingState('idle');
    setTimeLeft(choreography?.duration ?? 30);
    setUploadError(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!profile || !choreography || recordedFrames.length === 0) return;

    setRecordingState('uploading');
    setUploadError(null);

    try {
      // 압축
      const compact = compactPoseFrames(recordedFrames);

      // Storage 업로드
      const path = `references/${crypto.randomUUID()}.json.gz`;
      const uploadedPath = await uploadPoseData(compact, path);

      if (!uploadedPath) {
        setUploadError('포즈 데이터 업로드에 실패했습니다.');
        setRecordingState('preview');
        return;
      }

      // DB 레코드 생성
      const firstTs = recordedFrames[0].timestamp;
      const lastTs = recordedFrames[recordedFrames.length - 1].timestamp;
      const durationMs = Math.round(lastTs - firstTs);

      const refId = await createReference({
        choreographyId: choreography.id,
        recorderId: profile.id,
        poseDataUrl: uploadedPath,
        frameCount: recordedFrames.length,
        durationMs,
      });

      if (!refId) {
        setUploadError('레퍼런스 저장에 실패했습니다.');
        setRecordingState('preview');
        return;
      }

      setRecordingState('complete');
    } catch {
      setUploadError('업로드 중 오류가 발생했습니다.');
      setRecordingState('preview');
    }
  };

  if (isLoadingChoreo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  // 프리뷰 / 업로드 / 완료 화면
  if (recordingState === 'preview' || recordingState === 'uploading' || recordingState === 'complete') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 rounded-full bg-muted p-2 hover:bg-muted/80 transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {recordingState === 'complete' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">레퍼런스 저장 완료!</h2>
            <p className="text-muted-foreground mb-6">
              {choreography.title}의 레퍼런스가 등록되었습니다
            </p>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/')} variant="outline">
                홈으로
              </Button>
              <Button
                onClick={() => router.push(`/practice/${choreography.id}`)}
                variant="gradient"
              >
                연습하기
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">녹화 미리보기</h2>

            <RecordingPreview frames={recordedFrames} />

            {uploadError && (
              <p className="text-destructive text-sm mt-3">{uploadError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleReRecord}
                variant="outline"
                disabled={recordingState === 'uploading'}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                다시 녹화
              </Button>
              <Button
                onClick={handleSave}
                variant="gradient"
                disabled={recordingState === 'uploading'}
              >
                {recordingState === 'uploading' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    저장하기
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 녹화 화면 (idle / countdown / recording)
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

      {/* FPS */}
      {isDetecting && (
        <div className="absolute top-4 right-4 z-30 rounded bg-black/50 px-2 py-1 text-xs text-white/70">
          {fps} FPS
        </div>
      )}

      {/* 녹화 중 표시 */}
      {recordingState === 'recording' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-red-600/80 px-4 py-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-medium text-white">REC</span>
        </div>
      )}

      {/* 비디오 + 스켈레톤 */}
      <div className="relative h-full w-full">
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

      {/* 상태별 오버레이 */}
      <AnimatePresence mode="wait">
        {recordingState === 'idle' && !isCameraReady && !cameraError && (
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

        {recordingState === 'idle' && isCameraReady && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40"
          >
            <div className="text-center mb-8">
              <p className="text-sm text-amber-400 font-medium mb-2">
                레퍼런스 녹화
              </p>
              <h2 className="text-2xl font-bold text-white mb-2">
                {choreography.title}
              </h2>
              <p className="text-white/70">
                {choreography.artist} · {choreography.duration}초
              </p>
            </div>
            <Button
              onClick={handleStartRecording}
              size="lg"
              className="rounded-full px-8 py-6 text-lg bg-red-600 hover:bg-red-700 text-white"
            >
              녹화 시작
            </Button>
            <p className="text-white/50 text-sm mt-4">
              카메라 앞에서 춤을 추세요
            </p>
          </motion.div>
        )}

        {recordingState === 'countdown' && (
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
      </AnimatePresence>

      {/* 타이머 (녹화 중) */}
      {recordingState === 'recording' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/60 px-6 py-2"
        >
          <span className="text-2xl font-bold tabular-nums text-white">
            {timeLeft}
          </span>
        </motion.div>
      )}

      {/* 프로그레스 바 (녹화 중) */}
      {recordingState === 'recording' && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1.5 bg-white/10">
          <motion.div
            className="h-full bg-red-500"
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
