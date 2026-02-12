'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PoseFrame } from '@/types';

const SKELETON_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28],
];

interface RecordingPreviewProps {
  frames: PoseFrame[];
  width?: number;
  height?: number;
}

export function RecordingPreview({
  frames,
  width = 360,
  height = 640,
}: RecordingPreviewProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  const drawFrame = useCallback(
    (index: number): void => {
      const canvas = canvasRef.current;
      if (!canvas || index >= frames.length) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 배경
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const landmarks = frames[index].landmarks;

      // 관절점
      ctx.fillStyle = 'rgba(124, 58, 237, 0.9)';
      for (const lm of landmarks) {
        if (lm.visibility < 0.5) continue;
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 연결선
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 3;
      for (const [i, j] of SKELETON_CONNECTIONS) {
        const a = landmarks[i];
        const b = landmarks[j];
        if (!a || !b || a.visibility < 0.5 || b.visibility < 0.5) continue;
        ctx.beginPath();
        ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
        ctx.stroke();
      }
    },
    [frames]
  );

  const play = useCallback((): void => {
    if (frames.length === 0) return;

    setIsPlaying(true);
    const startTime = performance.now();
    const firstTimestamp = frames[0].timestamp;
    const lastTimestamp = frames[frames.length - 1].timestamp;
    const totalDuration = lastTimestamp - firstTimestamp;

    const animate = (): void => {
      const elapsed = performance.now() - startTime;

      if (elapsed >= totalDuration) {
        setIsPlaying(false);
        setCurrentFrameIndex(frames.length - 1);
        drawFrame(frames.length - 1);
        return;
      }

      const targetTimestamp = firstTimestamp + elapsed;

      // 이진 탐색으로 가장 가까운 프레임 찾기
      let lo = 0;
      let hi = frames.length - 1;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (frames[mid].timestamp < targetTimestamp) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }

      setCurrentFrameIndex(lo);
      drawFrame(lo);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [frames, drawFrame]);

  // 초기 첫 프레임 렌더링
  useEffect(() => {
    if (frames.length > 0) {
      drawFrame(0);
    }
  }, [frames, drawFrame]);

  // 클린업
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const progress =
    frames.length > 1 ? (currentFrameIndex / (frames.length - 1)) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative rounded-lg overflow-hidden border border-border">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block"
          style={{ width: width / 2, height: height / 2 }}
        />
        {/* 프로그레스 바 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full gradient-primary transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={play}
          disabled={isPlaying || frames.length === 0}
          variant="outline"
          size="sm"
        >
          <Play className="h-4 w-4 mr-1" />
          재생
        </Button>
        <Button
          onClick={() => {
            setCurrentFrameIndex(0);
            drawFrame(0);
          }}
          disabled={isPlaying}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          처음으로
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {frames.length}프레임 · {((frames[frames.length - 1]?.timestamp ?? 0) - (frames[0]?.timestamp ?? 0)).toFixed(0)}ms
      </p>
    </div>
  );
}
