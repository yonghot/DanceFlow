'use client';

import { useState, useEffect } from 'react';
import { getPrimaryReference, type ReferenceInfo } from '@/lib/supabase/repos/referenceRepo';
import { downloadPoseData } from '@/lib/supabase/poseStorage';
import { expandPoseFrames } from '@/lib/pose/compression';
import type { PoseFrame } from '@/types';

interface UseReferenceReturn {
  referenceInfo: ReferenceInfo | null;
  referenceFrames: PoseFrame[];
  isLoading: boolean;
  error: string | null;
}

// 메모리 캐시 (페이지 수명 동안 유지)
const cache = new Map<string, PoseFrame[]>();

export function useReference(choreographyId: string): UseReferenceReturn {
  const [referenceInfo, setReferenceInfo] = useState<ReferenceInfo | null>(null);
  const [referenceFrames, setReferenceFrames] = useState<PoseFrame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);

      // 1. primary 레퍼런스 조회
      const ref = await getPrimaryReference(choreographyId);
      if (cancelled) return;

      if (!ref) {
        setReferenceInfo(null);
        setReferenceFrames([]);
        setIsLoading(false);
        return;
      }

      setReferenceInfo(ref);

      // 2. 캐시 확인
      const cached = cache.get(ref.id);
      if (cached) {
        setReferenceFrames(cached);
        setIsLoading(false);
        return;
      }

      // 3. Storage에서 다운로드 + 디코드
      const compactData = await downloadPoseData(ref.poseDataUrl);
      if (cancelled) return;

      if (!compactData) {
        setError('레퍼런스 데이터를 불러올 수 없습니다.');
        setIsLoading(false);
        return;
      }

      const frames = expandPoseFrames(compactData);
      cache.set(ref.id, frames);
      setReferenceFrames(frames);
      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [choreographyId]);

  return { referenceInfo, referenceFrames, isLoading, error };
}
