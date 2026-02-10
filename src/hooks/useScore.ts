'use client';

import { useCallback } from 'react';
import { usePracticeStore } from '@/stores/practiceStore';
import type {
  PoseFrame,
  Landmark,
  Grade,
  BodyPartScore,
  BodyPartType,
} from '@/types';
import { GRADE_THRESHOLDS } from '@/types';

/** Body part landmark index groups (MediaPipe BlazePose 33 landmarks) */
const BODY_PART_INDICES: Record<BodyPartType, number[]> = {
  leftArm: [11, 13, 15, 17, 19, 21],
  rightArm: [12, 14, 16, 18, 20, 22],
  torso: [11, 12, 23, 24],
  leftLeg: [23, 25, 27, 29, 31],
  rightLeg: [24, 26, 28, 30, 32],
};

/** Feedback messages by score tier */
const FEEDBACK_MAP: Record<string, string> = {
  excellent: 'Excellent movement!',
  good: 'Good form, keep it up!',
  fair: 'Getting there, focus on precision.',
  needsWork: 'Needs more practice on this area.',
};

function calculateLandmarkDistance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateSimilarityScore(
  userLandmarks: Landmark[],
  refLandmarks: Landmark[]
): number {
  if (userLandmarks.length === 0 || refLandmarks.length === 0) {
    return 0;
  }

  const count = Math.min(userLandmarks.length, refLandmarks.length);
  let totalDistance = 0;
  let validCount = 0;

  for (let i = 0; i < count; i++) {
    const userLm = userLandmarks[i];
    const refLm = refLandmarks[i];

    const minVisibility = Math.min(userLm.visibility, refLm.visibility);
    if (minVisibility < 0.5) {
      continue;
    }

    const distance = calculateLandmarkDistance(userLm, refLm);
    totalDistance += distance;
    validCount += 1;
  }

  if (validCount === 0) {
    return 0;
  }

  const avgDistance = totalDistance / validCount;
  const maxDistance = 1.0;
  const normalized = Math.max(0, 1 - avgDistance / maxDistance);
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
  const parts = Object.keys(BODY_PART_INDICES) as BodyPartType[];

  return parts.map((part) => {
    const indices = BODY_PART_INDICES[part];

    const userPartLandmarks = indices
      .filter((i) => i < userLandmarks.length)
      .map((i) => userLandmarks[i]);

    const refPartLandmarks = indices
      .filter((i) => i < refLandmarks.length)
      .map((i) => refLandmarks[i]);

    const score = calculateSimilarityScore(userPartLandmarks, refPartLandmarks);

    return {
      part,
      score,
      feedback: getFeedback(score),
    };
  });
}

function findClosestFrame(
  timestamp: number,
  frames: PoseFrame[]
): PoseFrame | null {
  if (frames.length === 0) return null;

  let closest = frames[0];
  let minDiff = Math.abs(frames[0].timestamp - timestamp);

  for (let i = 1; i < frames.length; i++) {
    const diff = Math.abs(frames[i].timestamp - timestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frames[i];
    }
  }

  return closest;
}

interface ScoreResult {
  totalScore: number;
  grade: Grade;
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
          bodyPartScores: [],
        };
        setScore(0);
        setGrade('miss');
        setBodyPartScores([]);
        return emptyResult;
      }

      let totalSimilarity = 0;
      const allBodyPartScores: Map<BodyPartType, number[]> = new Map();

      for (const userFrame of userPoses) {
        const refFrame = findClosestFrame(userFrame.timestamp, refPoses);
        if (!refFrame) continue;

        const frameSimilarity = calculateSimilarityScore(
          userFrame.landmarks,
          refFrame.landmarks
        );
        totalSimilarity += frameSimilarity;

        const frameBodyScores = calculateBodyPartScores(
          userFrame.landmarks,
          refFrame.landmarks
        );

        for (const bodyScore of frameBodyScores) {
          const existing = allBodyPartScores.get(bodyScore.part) ?? [];
          existing.push(bodyScore.score);
          allBodyPartScores.set(bodyScore.part, existing);
        }
      }

      const totalScore = Math.round(totalSimilarity / userPoses.length);
      const grade = getGrade(totalScore);

      const bodyPartScores: BodyPartScore[] = (
        Object.keys(BODY_PART_INDICES) as BodyPartType[]
      ).map((part) => {
        const scores = allBodyPartScores.get(part) ?? [0];
        const avgScore = Math.round(
          scores.reduce((sum, s) => sum + s, 0) / scores.length
        );
        return {
          part,
          score: avgScore,
          feedback: getFeedback(avgScore),
        };
      });

      setScore(totalScore);
      setGrade(grade);
      setBodyPartScores(bodyPartScores);

      return {
        totalScore,
        grade,
        bodyPartScores,
      };
    },
    [setScore, setGrade, setBodyPartScores]
  );

  return { calculateScore };
}
