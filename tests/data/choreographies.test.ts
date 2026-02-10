import { describe, it, expect } from 'vitest';
import {
  choreographies,
  getChoreographyById,
} from '@/lib/data/choreographies';

describe('choreographies', () => {
  it('6개 안무가 정의됨', () => {
    expect(choreographies).toHaveLength(6);
  });

  it('각 안무에 필수 필드가 존재', () => {
    for (const choreo of choreographies) {
      expect(choreo.id).toBeTruthy();
      expect(choreo.title).toBeTruthy();
      expect(choreo.artist).toBeTruthy();
      expect(choreo.difficulty).toBeTruthy();
      expect(choreo.duration).toBeGreaterThan(0);
      expect(Array.isArray(choreo.referencePoses)).toBe(true);
    }
  });

  it('모든 ID가 고유함', () => {
    const ids = choreographies.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('difficulty가 유효한 값', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    for (const choreo of choreographies) {
      expect(validDifficulties).toContain(choreo.difficulty);
    }
  });

  it('3가지 난이도가 모두 포함됨', () => {
    const difficulties = new Set(choreographies.map((c) => c.difficulty));
    expect(difficulties.has('beginner')).toBe(true);
    expect(difficulties.has('intermediate')).toBe(true);
    expect(difficulties.has('advanced')).toBe(true);
  });
});

describe('getChoreographyById', () => {
  it('존재하는 ID → 안무 반환', () => {
    const choreo = getChoreographyById('newjeans-super-shy');
    expect(choreo).toBeDefined();
    expect(choreo!.title).toBe('Super Shy');
    expect(choreo!.artist).toBe('NewJeans');
  });

  it('존재하지 않는 ID → undefined', () => {
    expect(getChoreographyById('nonexistent')).toBeUndefined();
  });

  it('모든 안무를 ID로 조회 가능', () => {
    for (const choreo of choreographies) {
      const found = getChoreographyById(choreo.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(choreo.id);
    }
  });
});
