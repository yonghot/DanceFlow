import { type Landmark } from '@/types';

// BlazePose 관절 인덱스: 왼쪽 엉덩이 23, 오른쪽 엉덩이 24
const LEFT_HIP_INDEX = 23;
const RIGHT_HIP_INDEX = 24;

/**
 * 관절점을 엉덩이 중심 기준으로 0-1 범위로 정규화한다.
 * 엉덩이 중심을 원점으로 이동한 뒤 최대 거리로 나누어 정규화한다.
 */
export function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
  if (landmarks.length === 0) {
    return [];
  }

  const leftHip = landmarks[LEFT_HIP_INDEX];
  const rightHip = landmarks[RIGHT_HIP_INDEX];

  // 엉덩이 중심점
  const centerX = (leftHip.x + rightHip.x) / 2;
  const centerY = (leftHip.y + rightHip.y) / 2;
  const centerZ = (leftHip.z + rightHip.z) / 2;

  // 중심 기준 상대 좌표로 변환
  const shifted = landmarks.map((lm) => ({
    x: lm.x - centerX,
    y: lm.y - centerY,
    z: lm.z - centerZ,
    visibility: lm.visibility,
  }));

  // 최대 거리 계산 (0 나누기 방지)
  let maxDist = 0;
  for (const lm of shifted) {
    const dist = Math.sqrt(lm.x * lm.x + lm.y * lm.y + lm.z * lm.z);
    if (dist > maxDist) {
      maxDist = dist;
    }
  }

  if (maxDist === 0) {
    return shifted;
  }

  // 0-1 범위 정규화
  return shifted.map((lm) => ({
    x: lm.x / maxDist,
    y: lm.y / maxDist,
    z: lm.z / maxDist,
    visibility: lm.visibility,
  }));
}

/** 세 점 a-b-c 사이의 각도를 도(degree) 단위로 계산한다. b가 꼭짓점이다. */
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  if (magBA === 0 || magBC === 0) {
    return 0;
  }

  // 부동소수점 오차로 -1~1 범위를 벗어나는 경우 클램프
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}
