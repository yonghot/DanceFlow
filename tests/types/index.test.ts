import { describe, it, expect } from 'vitest';
import { GRADE_THRESHOLDS, GRADE_CONFIG } from '@/types';
import type { Grade } from '@/types';

describe('GRADE_THRESHOLDS', () => {
  const grades: Grade[] = ['perfect', 'great', 'good', 'ok', 'miss'];

  it('5개 등급이 정의됨', () => {
    expect(Object.keys(GRADE_THRESHOLDS)).toHaveLength(5);
  });

  it('각 등급에 min, max 범위가 존재', () => {
    for (const grade of grades) {
      const threshold = GRADE_THRESHOLDS[grade];
      expect(threshold).toHaveProperty('min');
      expect(threshold).toHaveProperty('max');
      expect(threshold.min).toBeLessThanOrEqual(threshold.max);
    }
  });

  it('전체 점수 범위 0-100 커버', () => {
    expect(GRADE_THRESHOLDS.miss.min).toBe(0);
    expect(GRADE_THRESHOLDS.perfect.max).toBe(100);
  });

  it('등급 간 범위가 겹치지 않고 연속적', () => {
    expect(GRADE_THRESHOLDS.perfect.min).toBe(GRADE_THRESHOLDS.great.max + 1);
    expect(GRADE_THRESHOLDS.great.min).toBe(GRADE_THRESHOLDS.good.max + 1);
    expect(GRADE_THRESHOLDS.good.min).toBe(GRADE_THRESHOLDS.ok.max + 1);
    expect(GRADE_THRESHOLDS.ok.min).toBe(GRADE_THRESHOLDS.miss.max + 1);
  });
});

describe('GRADE_CONFIG', () => {
  const grades: Grade[] = ['perfect', 'great', 'good', 'ok', 'miss'];

  it('5개 등급 설정이 정의됨', () => {
    expect(Object.keys(GRADE_CONFIG)).toHaveLength(5);
  });

  it('각 등급에 label, minScore, color가 존재', () => {
    for (const grade of grades) {
      const config = GRADE_CONFIG[grade];
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('minScore');
      expect(config).toHaveProperty('color');
    }
  });

  it('minScore가 GRADE_THRESHOLDS.min과 일치', () => {
    for (const grade of grades) {
      expect(GRADE_CONFIG[grade].minScore).toBe(
        GRADE_THRESHOLDS[grade].min
      );
    }
  });

  it('색상 값이 유효한 HEX 형식', () => {
    for (const grade of grades) {
      expect(GRADE_CONFIG[grade].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
