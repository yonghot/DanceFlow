import { type PoseFrame, type Landmark } from '@/types';
import { computeDTW } from '@/lib/scoring/dtw';

// DTW 거리를 점수로 변환할 때 사용하는 최대 거리 기준값.
// 이 값 이상이면 0점, 0이면 100점.
const MAX_DTW_DISTANCE = 50;

/** Landmark 배열을 [x0,y0,z0, x1,y1,z1, ...] 1차원 배열로 변환한다. */
function flattenLandmarks(landmarks: Landmark[]): number[] {
  const result: number[] = [];
  for (const lm of landmarks) {
    result.push(lm.x, lm.y, lm.z);
  }
  return result;
}

/** PoseFrame 시퀀스를 프레임별 플랫 벡터의 연결 시계열로 변환한다. */
function posesToTimeSeries(poses: PoseFrame[]): number[] {
  const series: number[] = [];
  for (const pose of poses) {
    const flat = flattenLandmarks(pose.landmarks);
    series.push(...flat);
  }
  return series;
}

/**
 * 사용자 포즈 시퀀스와 레퍼런스 포즈 시퀀스의 유사도를 0-100 점수로 계산한다.
 * DTW 거리가 작을수록 높은 점수를 반환한다.
 */
export function calculateSimilarityScore(
  userPoses: PoseFrame[],
  refPoses: PoseFrame[]
): number {
  if (userPoses.length === 0 || refPoses.length === 0) {
    return 0;
  }

  const userSeries = posesToTimeSeries(userPoses);
  const refSeries = posesToTimeSeries(refPoses);

  const distance = computeDTW(userSeries, refSeries);

  // 거리를 0-100 점수로 변환 (거리가 클수록 낮은 점수)
  const normalized = Math.max(0, 1 - distance / MAX_DTW_DISTANCE);
  return Math.round(normalized * 100);
}
