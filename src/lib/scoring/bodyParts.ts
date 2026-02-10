import { type PoseFrame, type BodyPartScore, type BodyPartType } from '@/types';
import { computeDTW } from '@/lib/scoring/dtw';

/** BlazePose 관절 인덱스를 신체 부위별로 매핑 */
export const BODY_PART_INDICES: Record<BodyPartType, number[]> = {
  leftArm: [11, 13, 15, 17, 19, 21],
  rightArm: [12, 14, 16, 18, 20, 22],
  torso: [11, 12, 23, 24],
  leftLeg: [23, 25, 27, 29, 31],
  rightLeg: [24, 26, 28, 30, 32],
};

// 부위별 DTW 거리-점수 변환 기준값
const MAX_PART_DISTANCE = 30;

// 부위별 한국어 라벨
const BODY_PART_LABELS: Record<BodyPartType, string> = {
  leftArm: '왼팔',
  rightArm: '오른팔',
  torso: '상체',
  leftLeg: '왼다리',
  rightLeg: '오른다리',
};

/** 특정 부위의 관절점만 추출하여 1차원 시계열로 변환한다. */
function extractPartSeries(poses: PoseFrame[], indices: number[]): number[] {
  const series: number[] = [];
  for (const pose of poses) {
    for (const idx of indices) {
      const lm = pose.landmarks[idx];
      series.push(lm.x, lm.y, lm.z);
    }
  }
  return series;
}

/** 점수에 따른 피드백 메시지를 생성한다. */
function generateFeedback(part: BodyPartType, score: number): string {
  const label = BODY_PART_LABELS[part];
  if (score >= 95) return `${label} 동작이 완벽해요!`;
  if (score >= 80) return `${label} 동작이 훌륭해요!`;
  if (score >= 65) return `${label} 동작이 좋아요. 조금만 더 신경 써 보세요.`;
  if (score >= 50) return `${label} 동작을 좀 더 크게 해 보세요.`;
  return `${label} 동작에 집중해서 다시 연습해 보세요.`;
}

/**
 * 신체 부위별 점수를 계산한다.
 * 각 부위에 해당하는 관절점을 추출하여 DTW 거리를 구하고 0-100 점수로 변환한다.
 */
export function calculateBodyPartScores(
  userPoses: PoseFrame[],
  refPoses: PoseFrame[]
): BodyPartScore[] {
  if (userPoses.length === 0 || refPoses.length === 0) {
    return (Object.keys(BODY_PART_INDICES) as BodyPartType[]).map((part) => ({
      part,
      score: 0,
      feedback: generateFeedback(part, 0),
    }));
  }

  const parts = Object.keys(BODY_PART_INDICES) as BodyPartType[];

  return parts.map((part) => {
    const indices = BODY_PART_INDICES[part];
    const userSeries = extractPartSeries(userPoses, indices);
    const refSeries = extractPartSeries(refPoses, indices);

    const distance = computeDTW(userSeries, refSeries);
    const normalized = Math.max(0, 1 - distance / MAX_PART_DISTANCE);
    const score = Math.round(normalized * 100);

    return {
      part,
      score,
      feedback: generateFeedback(part, score),
    };
  });
}
