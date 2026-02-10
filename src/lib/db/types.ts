import type {
  Grade,
  BodyPartScore,
  UserSettings,
  Difficulty,
  PoseFrame,
} from '@/types';

// IndexedDB 저장용 사용자 (Date -> number 변환)
export interface DBUser {
  id: string;
  nickname: string;
  createdAt: number;
  settings: UserSettings;
}

// IndexedDB 저장용 연습 기록 (Date -> number 변환)
export interface DBPracticeRecord {
  id: string;
  userId: string;
  choreographyId: string;
  totalScore: number;
  grade: Grade;
  bodyPartScores: BodyPartScore[];
  duration: number;
  practicedAt: number;
}

// IndexedDB 저장용 안무 정보
export interface DBChoreography {
  id: string;
  title: string;
  artist: string;
  difficulty: Difficulty;
  duration: number;
  referencePoses: PoseFrame[];
  thumbnailUrl: string;
}
