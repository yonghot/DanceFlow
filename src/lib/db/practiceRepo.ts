import { db } from '@/lib/db/database';
import type { PracticeRecord } from '@/types';
import type { DBPracticeRecord } from '@/lib/db/types';

// DBPracticeRecord -> PracticeRecord 변환
function toRecord(dbRecord: DBPracticeRecord): PracticeRecord {
  return {
    ...dbRecord,
    practicedAt: new Date(dbRecord.practicedAt),
  };
}

// PracticeRecord -> DBPracticeRecord 변환
function toDBRecord(record: PracticeRecord): DBPracticeRecord {
  return {
    ...record,
    practicedAt: record.practicedAt.getTime(),
  };
}

// 연습 기록 저장
export async function savePracticeRecord(
  record: PracticeRecord
): Promise<string> {
  const dbRecord = toDBRecord(record);
  return db.practiceRecords.put(dbRecord);
}

// 사용자별 기록 조회 (최신순)
export async function getPracticeRecords(
  userId: string
): Promise<PracticeRecord[]> {
  const dbRecords = await db.practiceRecords
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('practicedAt');

  return dbRecords.map(toRecord);
}

// 안무별 최고 점수 조회
export async function getBestScore(
  userId: string,
  choreographyId: string
): Promise<number | null> {
  const records = await db.practiceRecords
    .where('[userId+choreographyId]')
    .equals([userId, choreographyId])
    .toArray();

  if (records.length === 0) {
    return null;
  }

  return Math.max(...records.map((r) => r.totalScore));
}

// 연속 연습일 계산
export async function getStreak(userId: string): Promise<number> {
  const records = await db.practiceRecords
    .where('userId')
    .equals(userId)
    .toArray();

  if (records.length === 0) {
    return 0;
  }

  // 연습한 날짜를 YYYY-MM-DD 기준으로 중복 제거 후 내림차순 정렬
  const uniqueDays = [
    ...new Set(
      records.map((r) => {
        const d = new Date(r.practicedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    ),
  ]
    .map((key) => {
      const [year, month, date] = key.split('-').map(Number);
      return new Date(year, month, date).getTime();
    })
    .sort((a, b) => b - a);

  // 오늘 날짜 기준으로 연속일 계산
  const today = new Date();
  const todayKey = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const ONE_DAY = 24 * 60 * 60 * 1000;

  // 오늘 또는 어제부터 시작하지 않으면 스트릭 0
  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== todayKey - ONE_DAY) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === ONE_DAY) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// 최근 N개 기록 조회
export async function getRecentRecords(
  userId: string,
  limit: number
): Promise<PracticeRecord[]> {
  const dbRecords = await db.practiceRecords
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('practicedAt');

  return dbRecords.slice(0, limit).map(toRecord);
}
