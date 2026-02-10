import { type Grade } from '@/types';

interface GradeDisplayConfig {
  label: string;
  color: string;
}

/** 점수(0-100)를 등급으로 변환한다. */
export function getGrade(score: number): Grade {
  if (score >= 95) return 'perfect';
  if (score >= 80) return 'great';
  if (score >= 65) return 'good';
  if (score >= 50) return 'ok';
  return 'miss';
}

const GRADE_DISPLAY_CONFIG: Record<Grade, GradeDisplayConfig> = {
  perfect: { label: '퍼펙트', color: '#FFD700' },
  great: { label: '훌륭해요', color: '#7C3AED' },
  good: { label: '좋아요', color: '#06B6D4' },
  ok: { label: '괜찮아요', color: '#64748B' },
  miss: { label: '다시 도전', color: '#EF4444' },
};

/** 등급에 대한 한국어 라벨과 색상을 반환한다. */
export function getGradeConfig(grade: Grade): GradeDisplayConfig {
  return GRADE_DISPLAY_CONFIG[grade];
}
