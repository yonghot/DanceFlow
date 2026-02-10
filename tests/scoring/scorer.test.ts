import { describe, it, expect } from 'vitest';
import { calculateSimilarityScore } from '@/lib/scoring/scorer';
import type { PoseFrame, Landmark } from '@/types';

function makeLandmark(x: number, y: number, z: number): Landmark {
  return { x, y, z, visibility: 1.0 };
}

function makePoseFrame(
  landmarks: Landmark[],
  timestamp = 0
): PoseFrame {
  return { timestamp, landmarks };
}

describe('calculateSimilarityScore', () => {
  it('빈 시퀀스 → 0점', () => {
    const pose = makePoseFrame([makeLandmark(1, 2, 3)]);
    expect(calculateSimilarityScore([], [pose])).toBe(0);
    expect(calculateSimilarityScore([pose], [])).toBe(0);
    expect(calculateSimilarityScore([], [])).toBe(0);
  });

  it('동일한 포즈 → 100점', () => {
    const landmarks = [makeLandmark(0, 0, 0), makeLandmark(1, 1, 1)];
    const poses = [makePoseFrame(landmarks, 0)];
    expect(calculateSimilarityScore(poses, poses)).toBe(100);
  });

  it('0-100 범위의 점수 반환', () => {
    const ref = [
      makePoseFrame([makeLandmark(0, 0, 0)], 0),
      makePoseFrame([makeLandmark(1, 1, 1)], 100),
    ];
    const user = [
      makePoseFrame([makeLandmark(0.5, 0.5, 0.5)], 0),
      makePoseFrame([makeLandmark(1.5, 1.5, 1.5)], 100),
    ];
    const score = calculateSimilarityScore(user, ref);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('유사한 포즈가 다른 포즈보다 높은 점수', () => {
    const ref = [makePoseFrame([makeLandmark(1, 1, 1)], 0)];
    const similar = [makePoseFrame([makeLandmark(1.01, 1.01, 1.01)], 0)];
    const different = [makePoseFrame([makeLandmark(10, 10, 10)], 0)];

    const scoreSimilar = calculateSimilarityScore(similar, ref);
    const scoreDifferent = calculateSimilarityScore(different, ref);

    expect(scoreSimilar).toBeGreaterThan(scoreDifferent);
  });
});
