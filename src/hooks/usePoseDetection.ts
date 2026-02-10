'use client';

import { useRef, useCallback, useEffect } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { usePoseStore } from '@/stores/poseStore';
import type { Landmark } from '@/types';

interface UsePoseDetectionReturn {
  isDetectorReady: boolean;
  isDetecting: boolean;
  currentPose: Landmark[] | null;
  fps: number;
  startDetection: (videoElement: HTMLVideoElement) => void;
  stopDetection: () => void;
}

export function usePoseDetection(): UsePoseDetectionReturn {
  const detectorRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    isDetectorReady,
    isDetecting,
    currentPose,
    fps,
    setDetectorReady,
    setDetecting,
    setCurrentPose,
    setFps,
    reset,
  } = usePoseStore();

  const initializeDetector = useCallback(async (): Promise<PoseLandmarker> => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });

    return poseLandmarker;
  }, []);

  const startDetection = useCallback(
    (videoElement: HTMLVideoElement): void => {
      const runDetectionLoop = async (): Promise<void> => {
        try {
          if (!detectorRef.current) {
            const detector = await initializeDetector();
            detectorRef.current = detector;
            setDetectorReady(true);
          }

          setDetecting(true);
          frameCountRef.current = 0;

          fpsIntervalRef.current = setInterval(() => {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
          }, 1000);

          const detect = (): void => {
            if (!detectorRef.current || videoElement.paused || videoElement.ended) {
              return;
            }

            const now = performance.now();
            if (now > lastTimeRef.current) {
              const result = detectorRef.current.detectForVideo(videoElement, now);

              if (result.landmarks && result.landmarks.length > 0) {
                const landmarks: Landmark[] = result.landmarks[0].map((lm) => ({
                  x: lm.x,
                  y: lm.y,
                  z: lm.z,
                  visibility: lm.visibility ?? 0,
                }));
                setCurrentPose(landmarks);
              } else {
                setCurrentPose(null);
              }

              lastTimeRef.current = now;
              frameCountRef.current += 1;
            }

            animationFrameRef.current = requestAnimationFrame(detect);
          };

          animationFrameRef.current = requestAnimationFrame(detect);
        } catch (err: unknown) {
          console.error('Pose detection initialization failed:', err);
          setDetecting(false);
        }
      };

      runDetectionLoop();
    },
    [initializeDetector, setDetectorReady, setDetecting, setCurrentPose, setFps]
  );

  const stopDetection = useCallback((): void => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (fpsIntervalRef.current !== null) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }

    setDetecting(false);
    setCurrentPose(null);
  }, [setDetecting, setCurrentPose]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (fpsIntervalRef.current !== null) {
        clearInterval(fpsIntervalRef.current);
      }

      if (detectorRef.current) {
        detectorRef.current.close();
        detectorRef.current = null;
      }

      reset();
    };
  }, [reset]);

  return {
    isDetectorReady,
    isDetecting,
    currentPose,
    fps,
    startDetection,
    stopDetection,
  };
}
