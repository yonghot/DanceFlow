'use client';

import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';

interface UseCameraReturn {
  videoRef: RefObject<HTMLVideoElement>;
  isReady: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          facingMode: 'user',
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr: unknown) {
          // play() 중단은 무시 (페이지 이동/언마운트 시 발생)
          if (
            playErr instanceof DOMException &&
            playErr.name === 'AbortError'
          ) {
            return;
          }
          throw playErr;
        }
        setIsReady(true);
      }
    } catch (err: unknown) {
      // 언마운트 후 상태 업데이트 방지
      if (!streamRef.current && !videoRef.current?.srcObject) return;

      let message = '카메라에 접근할 수 없습니다.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          message = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라를 허용해주세요.';
        } else if (err.name === 'NotFoundError') {
          message = '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.';
        } else if (err.name === 'NotReadableError') {
          message = '카메라가 다른 앱에서 사용 중입니다. 다른 앱을 닫고 다시 시도해주세요.';
        }
      }
      setError(message);
      setIsReady(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isReady,
    error,
    startCamera,
    stopCamera,
  };
}
