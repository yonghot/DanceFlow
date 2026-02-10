import { describe, it, expect } from 'vitest';
import { getGrade, getGradeConfig } from '@/lib/scoring/grading';

describe('getGrade', () => {
  it('95점 이상 → perfect', () => {
    expect(getGrade(95)).toBe('perfect');
    expect(getGrade(100)).toBe('perfect');
  });

  it('80-94점 → great', () => {
    expect(getGrade(80)).toBe('great');
    expect(getGrade(94)).toBe('great');
  });

  it('65-79점 → good', () => {
    expect(getGrade(65)).toBe('good');
    expect(getGrade(79)).toBe('good');
  });

  it('50-64점 → ok', () => {
    expect(getGrade(50)).toBe('ok');
    expect(getGrade(64)).toBe('ok');
  });

  it('49점 이하 → miss', () => {
    expect(getGrade(49)).toBe('miss');
    expect(getGrade(0)).toBe('miss');
  });

  it('경계값 정확히 처리', () => {
    expect(getGrade(95)).toBe('perfect');
    expect(getGrade(94)).toBe('great');
    expect(getGrade(80)).toBe('great');
    expect(getGrade(79)).toBe('good');
    expect(getGrade(65)).toBe('good');
    expect(getGrade(64)).toBe('ok');
    expect(getGrade(50)).toBe('ok');
    expect(getGrade(49)).toBe('miss');
  });
});

describe('getGradeConfig', () => {
  it('모든 등급에 대해 label과 color 반환', () => {
    const grades = ['perfect', 'great', 'good', 'ok', 'miss'] as const;

    for (const grade of grades) {
      const config = getGradeConfig(grade);
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(config.label).toBeTruthy();
      expect(config.color).toMatch(/^#/);
    }
  });

  it('perfect → 한국어 라벨 "퍼펙트"', () => {
    expect(getGradeConfig('perfect').label).toBe('퍼펙트');
  });

  it('miss → 한국어 라벨 "다시 도전"', () => {
    expect(getGradeConfig('miss').label).toBe('다시 도전');
  });
});
