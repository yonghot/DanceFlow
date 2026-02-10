import { describe, it, expect } from 'vitest';
import { computeDTW } from '@/lib/scoring/dtw';

describe('computeDTW', () => {
  it('동일한 시퀀스 → 거리 0', () => {
    expect(computeDTW([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it('빈 시퀀스 → 거리 0', () => {
    expect(computeDTW([], [1, 2, 3])).toBe(0);
    expect(computeDTW([1, 2, 3], [])).toBe(0);
    expect(computeDTW([], [])).toBe(0);
  });

  it('다른 시퀀스 → 양수 거리', () => {
    const dist = computeDTW([1, 2, 3], [4, 5, 6]);
    expect(dist).toBeGreaterThan(0);
  });

  it('길이가 다른 시퀀스도 처리 가능', () => {
    const dist = computeDTW([1, 2, 3, 4, 5], [1, 3, 5]);
    expect(dist).toBeGreaterThanOrEqual(0);
  });

  it('대칭성: DTW(A,B) === DTW(B,A)', () => {
    const a = [1, 3, 5, 7];
    const b = [2, 4, 6, 8];
    expect(computeDTW(a, b)).toBe(computeDTW(b, a));
  });

  it('단일 원소 시퀀스', () => {
    expect(computeDTW([5], [5])).toBe(0);
    expect(computeDTW([5], [10])).toBe(5);
  });

  it('유사한 시퀀스가 다른 시퀀스보다 거리가 작다', () => {
    const ref = [1, 2, 3, 4, 5];
    const similar = [1, 2, 3, 4, 6];
    const different = [10, 20, 30, 40, 50];

    expect(computeDTW(ref, similar)).toBeLessThan(
      computeDTW(ref, different)
    );
  });
});
