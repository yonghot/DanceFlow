// 채점 등급
export type Grade = 'perfect' | 'great' | 'good' | 'ok' | 'miss';

// 등급 판정 임계값 (점수 범위)
export const GRADE_THRESHOLDS: Record<Grade, { min: number; max: number }> = {
  perfect: { min: 95, max: 100 },
  great: { min: 80, max: 94 },
  good: { min: 65, max: 79 },
  ok: { min: 50, max: 64 },
  miss: { min: 0, max: 49 },
} as const;

// MediaPipe BlazePose 단일 관절 좌표
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// 특정 시점의 포즈 프레임 (33개 관절)
export interface PoseFrame {
  timestamp: number;
  landmarks: Landmark[];
}

// 신체 부위 분류
export type BodyPartType =
  | 'leftArm'
  | 'rightArm'
  | 'torso'
  | 'leftLeg'
  | 'rightLeg';

// 신체 부위별 점수 및 피드백
export interface BodyPartScore {
  part: BodyPartType;
  score: number;
  feedback: string;
}

// 난이도
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 안무 정보
export interface Choreography {
  id: string;
  title: string;
  artist: string;
  difficulty: Difficulty;
  duration: number;
  referencePoses: PoseFrame[];
  thumbnailUrl: string;
}

// 연습 기록
export interface PracticeRecord {
  id: string;
  userId: string;
  choreographyId: string;
  totalScore: number;
  grade: Grade;
  bodyPartScores: BodyPartScore[];
  duration: number;
  practicedAt: Date;
}

// 사용자 설정
export interface UserSettings {
  nickname: string;
  mirrorMode: boolean;
  playbackSpeed: number;
}

// 사용자 정보
export interface User {
  id: string;
  nickname: string;
  createdAt: Date;
  settings: UserSettings;
}

// 연습 진행 상태
export type PracticeState = 'idle' | 'countdown' | 'practicing' | 'completed';

// 등급별 UI 설정
export interface GradeConfig {
  label: string;
  minScore: number;
  color: string;
}

// 등급별 설정 매핑
export const GRADE_CONFIG: Record<Grade, GradeConfig> = {
  perfect: { label: 'Perfect', minScore: 95, color: '#FFD700' },
  great: { label: 'Great', minScore: 80, color: '#4CAF50' },
  good: { label: 'Good', minScore: 65, color: '#2196F3' },
  ok: { label: 'OK', minScore: 50, color: '#FF9800' },
  miss: { label: 'Miss', minScore: 0, color: '#F44336' },
} as const;
