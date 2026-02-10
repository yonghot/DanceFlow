import { describe, it, expect } from 'vitest';
import {
  normalizeLandmarks,
  calculateAngle,
} from '@/lib/pose/normalizer';
import type { Landmark } from '@/types';

function makeLandmark(
  x: number,
  y: number,
  z: number,
  visibility = 1.0
): Landmark {
  return { x, y, z, visibility };
}

// BlazePose 33개 관절을 생성하는 헬퍼
function make33Landmarks(baseX = 0, baseY = 0, baseZ = 0): Landmark[] {
  return Array.from({ length: 33 }, (_, i) =>
    makeLandmark(baseX + i * 0.01, baseY + i * 0.01, baseZ)
  );
}

describe('normalizeLandmarks', () => {
  it('빈 배열 → 빈 배열', () => {
    expect(normalizeLandmarks([])).toEqual([]);
  });

  it('정규화 후 엉덩이 중심이 원점에 가까움', () => {
    const landmarks = make33Landmarks(1, 1, 0);
    const normalized = normalizeLandmarks(landmarks);

    // 인덱스 23(왼쪽 엉덩이)과 24(오른쪽 엉덩이)의 중심이 0에 가까움
    const hipCenter = {
      x: (normalized[23].x + normalized[24].x) / 2,
      y: (normalized[23].y + normalized[24].y) / 2,
      z: (normalized[23].z + normalized[24].z) / 2,
    };
    expect(Math.abs(hipCenter.x)).toBeLessThan(0.01);
    expect(Math.abs(hipCenter.y)).toBeLessThan(0.01);
    expect(Math.abs(hipCenter.z)).toBeLessThan(0.01);
  });

  it('정규화 후 값이 -1~1 범위', () => {
    const landmarks = make33Landmarks(5, 10, 3);
    const normalized = normalizeLandmarks(landmarks);

    for (const lm of normalized) {
      expect(lm.x).toBeGreaterThanOrEqual(-1);
      expect(lm.x).toBeLessThanOrEqual(1);
      expect(lm.y).toBeGreaterThanOrEqual(-1);
      expect(lm.y).toBeLessThanOrEqual(1);
    }
  });

  it('visibility는 보존됨', () => {
    const landmarks = make33Landmarks();
    landmarks[0] = makeLandmark(0, 0, 0, 0.5);
    const normalized = normalizeLandmarks(landmarks);
    expect(normalized[0].visibility).toBe(0.5);
  });

  it('모든 좌표가 동일한 경우 (maxDist === 0) 안전 처리', () => {
    const landmarks = Array.from({ length: 33 }, () =>
      makeLandmark(5, 5, 5)
    );
    const normalized = normalizeLandmarks(landmarks);
    // 모두 0이어야 함 (중심 이동 후 거리 0)
    for (const lm of normalized) {
      expect(lm.x).toBe(0);
      expect(lm.y).toBe(0);
      expect(lm.z).toBe(0);
    }
  });
});

describe('calculateAngle', () => {
  it('직선 (180도)', () => {
    const a = makeLandmark(0, 0, 0);
    const b = makeLandmark(1, 0, 0);
    const c = makeLandmark(2, 0, 0);
    expect(calculateAngle(a, b, c)).toBeCloseTo(180, 0);
  });

  it('직각 (90도)', () => {
    const a = makeLandmark(1, 0, 0);
    const b = makeLandmark(0, 0, 0);
    const c = makeLandmark(0, 1, 0);
    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 0);
  });

  it('영벡터 → 0도', () => {
    const a = makeLandmark(0, 0, 0);
    const b = makeLandmark(0, 0, 0);
    const c = makeLandmark(1, 0, 0);
    expect(calculateAngle(a, b, c)).toBe(0);
  });

  it('3D 각도 계산', () => {
    const a = makeLandmark(1, 0, 0);
    const b = makeLandmark(0, 0, 0);
    const c = makeLandmark(0, 0, 1);
    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 0);
  });

  it('결과가 0-180도 범위', () => {
    const cases = [
      [makeLandmark(1, 0, 0), makeLandmark(0, 0, 0), makeLandmark(0, 1, 0)],
      [makeLandmark(1, 1, 0), makeLandmark(0, 0, 0), makeLandmark(-1, 1, 0)],
      [makeLandmark(1, 0, 0), makeLandmark(0, 0, 0), makeLandmark(-1, 0, 0)],
    ];

    for (const [a, b, c] of cases) {
      const angle = calculateAngle(a, b, c);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(180);
    }
  });
});
