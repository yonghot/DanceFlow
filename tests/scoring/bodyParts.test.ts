import { describe, it, expect } from 'vitest';
import {
  calculateBodyPartScores,
  BODY_PART_INDICES,
} from '@/lib/scoring/bodyParts';
import type { PoseFrame, Landmark, BodyPartType } from '@/types';

function makeLandmark(x: number, y: number, z: number): Landmark {
  return { x, y, z, visibility: 1.0 };
}

function make33Landmarks(value = 0): Landmark[] {
  return Array.from({ length: 33 }, () => makeLandmark(value, value, value));
}

function makePoseFrame(landmarks: Landmark[], timestamp = 0): PoseFrame {
  return { timestamp, landmarks };
}

describe('BODY_PART_INDICES', () => {
  it('5개 신체 부위가 정의됨', () => {
    const parts = Object.keys(BODY_PART_INDICES);
    expect(parts).toHaveLength(5);
    expect(parts).toContain('leftArm');
    expect(parts).toContain('rightArm');
    expect(parts).toContain('torso');
    expect(parts).toContain('leftLeg');
    expect(parts).toContain('rightLeg');
  });

  it('모든 인덱스가 0-32 범위 내', () => {
    for (const indices of Object.values(BODY_PART_INDICES)) {
      for (const idx of indices) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThanOrEqual(32);
      }
    }
  });
});

describe('calculateBodyPartScores', () => {
  it('빈 시퀀스 → 모든 부위 0점', () => {
    const scores = calculateBodyPartScores([], []);
    expect(scores).toHaveLength(5);
    for (const s of scores) {
      expect(s.score).toBe(0);
      expect(s.feedback).toBeTruthy();
    }
  });

  it('동일한 포즈 → 모든 부위 100점', () => {
    const landmarks = make33Landmarks(1);
    const poses = [makePoseFrame(landmarks)];
    const scores = calculateBodyPartScores(poses, poses);

    for (const s of scores) {
      expect(s.score).toBe(100);
    }
  });

  it('각 부위에 대해 part, score, feedback 반환', () => {
    const poses = [makePoseFrame(make33Landmarks())];
    const scores = calculateBodyPartScores(poses, poses);

    for (const s of scores) {
      expect(s).toHaveProperty('part');
      expect(s).toHaveProperty('score');
      expect(s).toHaveProperty('feedback');
      expect(typeof s.score).toBe('number');
      expect(typeof s.feedback).toBe('string');
    }
  });

  it('피드백이 한국어 부위명을 포함', () => {
    const poses = [makePoseFrame(make33Landmarks())];
    const scores = calculateBodyPartScores(poses, poses);

    const koreanLabels = ['왼팔', '오른팔', '상체', '왼다리', '오른다리'];
    for (let i = 0; i < scores.length; i++) {
      expect(scores[i].feedback).toContain(koreanLabels[i]);
    }
  });

  it('점수가 0-100 범위', () => {
    const ref = [makePoseFrame(make33Landmarks(0))];
    const user = [makePoseFrame(make33Landmarks(5))];
    const scores = calculateBodyPartScores(user, ref);

    for (const s of scores) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
  });
});
