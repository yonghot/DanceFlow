'use client';

import { useCallback } from 'react';
import { usePracticeStore } from '@/stores/practiceStore';
import { normalizeLandmarks, calculateAngle } from '@/lib/pose/normalizer';
import { computeWindowedDTW } from '@/lib/scoring/dtw';
import type {
  PoseFrame,
  Landmark,
  Grade,
  BodyPartScore,
  BodyPartType,
} from '@/types';
import { GRADE_THRESHOLDS } from '@/types';

// 신체 부위별 관절 인덱스
const BODY_PART_INDICES: Record<BodyPartType, number[]> = {
  leftArm: [11, 13, 15, 17, 19, 21],
  rightArm: [12, 14, 16, 18, 20, 22],
  torso: [11, 12, 23, 24],
  leftLeg: [23, 25, 27, 29, 31],
  rightLeg: [24, 26, 28, 30, 32],
};

// 타이밍 점수 산출용 5개 핵심 관절 각도 정의 [a, b(꼭짓점), c]
const TIMING_ANGLE_JOINTS: [number, number, number][] = [
  [11, 13, 15], // 왼쪽 팔꿈치
  [12, 14, 16], // 오른쪽 팔꿈치
  [23, 25, 27], // 왼쪽 무릎
  [24, 26, 28], // 오른쪽 무릎
  [11, 23, 24], // 상체 (왼어깨-왼엉덩이-오른엉덩이)
];

// 가중치: 정확도 70%, 타이밍 30%
const ACCURACY_WEIGHT = 0.7;
const TIMING_WEIGHT = 0.3;

const FEEDBACK_MAP: Record<string, string> = {
  excellent: '정확한 동작입니다!',
  good: '잘하고 있어요!',
  fair: '조금 더 정확하게!',
  needsWork: '이 부분을 더 연습해보세요.',
};

function getLandmarkDistance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// 정규화된 랜드마크 간 유사도 (0-100)
function calculateSimilarityScore(
  userLandmarks: Landmark[],
  refLandmarks: Landmark[]
): number {
  if (userLandmarks.length === 0 || refLandmarks.length === 0) return 0;

  // 양쪽 모두 정규화
  const normalizedUser = normalizeLandmarks(userLandmarks);
  const normalizedRef = normalizeLandmarks(refLandmarks);

  const count = Math.min(normalizedUser.length, normalizedRef.length);
  let totalDistance = 0;
  let validCount = 0;

  for (let i = 0; i < count; i++) {
    const minVis = Math.min(normalizedUser[i].visibility, normalizedRef[i].visibility);
    if (minVis < 0.5) continue;

    totalDistance += getLandmarkDistance(normalizedUser[i], normalizedRef[i]);
    validCount++;
  }

  if (validCount === 0) return 0;

  const avgDistance = totalDistance / validCount;
  // 정규화 후 최대 거리 ~2.0 (양 끝)
  const normalized = Math.max(0, 1 - avgDistance / 2.0);
  return Math.round(normalized * 100);
}

function getGrade(score: number): Grade {
  if (score >= GRADE_THRESHOLDS.perfect.min) return 'perfect';
  if (score >= GRADE_THRESHOLDS.great.min) return 'great';
  if (score >= GRADE_THRESHOLDS.good.min) return 'good';
  if (score >= GRADE_THRESHOLDS.ok.min) return 'ok';
  return 'miss';
}

function getFeedback(score: number): string {
  if (score >= 90) return FEEDBACK_MAP.excellent;
  if (score >= 70) return FEEDBACK_MAP.good;
  if (score >= 50) return FEEDBACK_MAP.fair;
  return FEEDBACK_MAP.needsWork;
}

function calculateBodyPartScores(
  userLandmarks: Landmark[],
  refLandmarks: Landmark[]
): BodyPartScore[] {
  const normalizedUser = normalizeLandmarks(userLandmarks);
  const normalizedRef = normalizeLandmarks(refLandmarks);
  const parts = Object.keys(BODY_PART_INDICES) as BodyPartType[];

  return parts.map((part) => {
    const indices = BODY_PART_INDICES[part];

    const userPart = indices
      .filter((i) => i < normalizedUser.length)
      .map((i) => normalizedUser[i]);
    const refPart = indices
      .filter((i) => i < normalizedRef.length)
      .map((i) => normalizedRef[i]);

    let totalDist = 0;
    let valid = 0;

    for (let k = 0; k < Math.min(userPart.length, refPart.length); k++) {
      if (Math.min(userPart[k].visibility, refPart[k].visibility) < 0.5) continue;
      totalDist += getLandmarkDistance(userPart[k], refPart[k]);
      valid++;
    }

    const score = valid > 0
      ? Math.round(Math.max(0, 1 - (totalDist / valid) / 2.0) * 100)
      : 0;

    return { part, score, feedback: getFeedback(score) };
  });
}

// 이진 탐색으로 가장 가까운 프레임 찾기
function findClosestFrame(
  timestamp: number,
  frames: PoseFrame[]
): PoseFrame | null {
  if (frames.length === 0) return null;

  let lo = 0;
  let hi = frames.length - 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (frames[mid].timestamp < timestamp) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  // lo-1과 lo 중 더 가까운 쪽
  if (lo > 0) {
    const diffLo = Math.abs(frames[lo].timestamp - timestamp);
    const diffPrev = Math.abs(frames[lo - 1].timestamp - timestamp);
    if (diffPrev < diffLo) return frames[lo - 1];
  }

  return frames[lo];
}

// 프레임 시퀀스에서 관절 각도 시계열 추출
function extractAngleSeries(
  frames: PoseFrame[],
  joints: [number, number, number]
): number[] {
  return frames.map((frame) => {
    const [ai, bi, ci] = joints;
    const a = frame.landmarks[ai];
    const b = frame.landmarks[bi];
    const c = frame.landmarks[ci];
    if (!a || !b || !c) return 0;
    return calculateAngle(a, b, c);
  });
}

// 타이밍 점수 (5개 관절 각도의 windowed DTW 평균)
function calculateTimingScore(
  userFrames: PoseFrame[],
  refFrames: PoseFrame[]
): number {
  if (userFrames.length < 5 || refFrames.length < 5) return 0;

  let totalScore = 0;

  for (const joints of TIMING_ANGLE_JOINTS) {
    const userAngles = extractAngleSeries(userFrames, joints);
    const refAngles = extractAngleSeries(refFrames, joints);

    const dtwDist = computeWindowedDTW(userAngles, refAngles, 0.1);

    // 정규화: 평균 각도 차이를 점수로 변환
    const avgAngleDiff = dtwDist / Math.max(userAngles.length, refAngles.length);
    // 각도 차이 0° → 100점, 90° → 0점
    const score = Math.max(0, Math.round((1 - avgAngleDiff / 90) * 100));
    totalScore += score;
  }

  return Math.round(totalScore / TIMING_ANGLE_JOINTS.length);
}

export interface ScoreResult {
  totalScore: number;
  grade: Grade;
  accuracyScore: number;
  timingScore: number;
  bodyPartScores: BodyPartScore[];
}

interface UseScoreReturn {
  calculateScore: (
    userPoses: PoseFrame[],
    refPoses: PoseFrame[]
  ) => ScoreResult;
}

export function useScore(): UseScoreReturn {
  const { setScore, setGrade, setBodyPartScores } = usePracticeStore();

  const calculateScore = useCallback(
    (userPoses: PoseFrame[], refPoses: PoseFrame[]): ScoreResult => {
      if (userPoses.length === 0 || refPoses.length === 0) {
        const emptyResult: ScoreResult = {
          totalScore: 0,
          grade: 'miss',
          accuracyScore: 0,
          timingScore: 0,
          bodyPartScores: [],
        };
        setScore(0);
        setGrade('miss');
        setBodyPartScores([]);
        return emptyResult;
      }

      // 1. 정확도 점수 (프레임별 유사도 평균)
      let totalSimilarity = 0;
      const allBodyPartScores: Map<BodyPartType, number[]> = new Map();

      for (const userFrame of userPoses) {
        const refFrame = findClosestFrame(userFrame.timestamp, refPoses);
        if (!refFrame) continue;

        totalSimilarity += calculateSimilarityScore(
          userFrame.landmarks,
          refFrame.landmarks
        );

        const frameBodyScores = calculateBodyPartScores(
          userFrame.landmarks,
          refFrame.landmarks
        );

        for (const bs of frameBodyScores) {
          const existing = allBodyPartScores.get(bs.part) ?? [];
          existing.push(bs.score);
          allBodyPartScores.set(bs.part, existing);
        }
      }

      const accuracyScore = Math.round(totalSimilarity / userPoses.length);

      // 2. 타이밍 점수 (관절 각도 시계열 DTW)
      const timingScore = calculateTimingScore(userPoses, refPoses);

      // 3. 최종 점수 = 0.7 × 정확도 + 0.3 × 타이밍
      const totalScore = Math.round(
        accuracyScore * ACCURACY_WEIGHT + timingScore * TIMING_WEIGHT
      );
      const grade = getGrade(totalScore);

      // 4. 신체 부위별 평균
      const bodyPartScores: BodyPartScore[] = (
        Object.keys(BODY_PART_INDICES) as BodyPartType[]
      ).map((part) => {
        const scores = allBodyPartScores.get(part) ?? [0];
        const avgScore = Math.round(
          scores.reduce((sum, s) => sum + s, 0) / scores.length
        );
        return { part, score: avgScore, feedback: getFeedback(avgScore) };
      });

      setScore(totalScore);
      setGrade(grade);
      setBodyPartScores(bodyPartScores);

      return { totalScore, grade, accuracyScore, timingScore, bodyPartScores };
    },
    [setScore, setGrade, setBodyPartScores]
  );

  return { calculateScore };
}
