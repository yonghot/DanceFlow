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
