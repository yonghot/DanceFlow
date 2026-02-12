/**
 * Dynamic Time Warping 알고리즘.
 * 두 시계열 사이의 DTW 거리를 비용 행렬 기반 DP로 계산한다.
 */
export function computeDTW(seq1: number[], seq2: number[]): number {
  const n = seq1.length;
  const m = seq2.length;

  if (n === 0 || m === 0) {
    return 0;
  }

  // 비용 행렬 초기화 (Infinity로 채움)
  const cost: number[][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: m + 1 }, () => Infinity)
  );
  cost[0][0] = 0;

  // DP로 최적 경로 비용 계산
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const dist = Math.abs(seq1[i - 1] - seq2[j - 1]);
      cost[i][j] =
        dist +
        Math.min(
          cost[i - 1][j],     // 삽입
          cost[i][j - 1],     // 삭제
          cost[i - 1][j - 1]  // 매칭
        );
    }
  }

  return cost[n][m];
}

/**
 * Windowed DTW (Sakoe-Chiba 밴드).
 * 윈도우 크기 제한으로 연산량 약 85% 절감.
 * @param seq1 시퀀스 1 (각도 배열)
 * @param seq2 시퀀스 2 (각도 배열)
 * @param windowRatio 윈도우 비율 (0-1, 기본 0.1 = 시퀀스 길이의 10%)
 */
export function computeWindowedDTW(
  seq1: number[],
  seq2: number[],
  windowRatio = 0.1
): number {
  const n = seq1.length;
  const m = seq2.length;

  if (n === 0 || m === 0) return 0;

  const w = Math.max(1, Math.ceil(Math.max(n, m) * windowRatio));

  // 2행만 사용하는 공간 최적화 DP
  let prev = new Float64Array(m + 1).fill(Infinity);
  let curr = new Float64Array(m + 1).fill(Infinity);
  prev[0] = 0;

  for (let i = 1; i <= n; i++) {
    curr.fill(Infinity);

    const jStart = Math.max(1, i - w);
    const jEnd = Math.min(m, i + w);

    for (let j = jStart; j <= jEnd; j++) {
      const dist = Math.abs(seq1[i - 1] - seq2[j - 1]);
      curr[j] = dist + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }

    // swap
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[m];
}
