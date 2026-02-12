import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { PracticeRecord, Grade, BodyPartScore } from '@/types';

type PracticeRow = Database['public']['Tables']['practice_sessions']['Row'];

// DB Row → PracticeRecord 변환
function toRecord(row: PracticeRow): PracticeRecord {
  return {
    id: row.id,
    userId: row.user_id,
    choreographyId: row.choreography_id,
    referenceId: row.reference_id,
    totalScore: row.total_score,
    grade: row.grade as Grade,
    accuracyScore: row.accuracy_score,
    timingScore: row.timing_score,
    bodyPartScores: (row.body_part_scores ?? []) as BodyPartScore[],
    frameCount: row.frame_count,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  };
}

// 연습 기록 저장
export async function savePracticeSession(params: {
  userId: string;
  choreographyId: string;
  referenceId?: string | null;
  totalScore: number;
  grade: Grade;
  accuracyScore?: number | null;
  timingScore?: number | null;
  bodyPartScores: BodyPartScore[];
  frameCount: number;
  durationMs: number;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: params.userId,
      choreography_id: params.choreographyId,
      reference_id: params.referenceId ?? null,
      total_score: params.totalScore,
      grade: params.grade,
      accuracy_score: params.accuracyScore ?? null,
      timing_score: params.timingScore ?? null,
      body_part_scores: params.bodyPartScores.map((s) => ({
        part: s.part,
        score: s.score,
        feedback: s.feedback,
      })),
      frame_count: params.frameCount,
      duration_ms: params.durationMs,
    })
    .select('id')
    .returns<{ id: string }[]>()
    .single();

  if (error || !data) return null;
  return data.id;
}

// 사용자별 연습 기록 조회 (최신순)
export async function getPracticeSessions(
  userId: string,
  limit = 50
): Promise<PracticeRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();

  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<PracticeRow[]>();

  if (error || !data) return [];
  return data.map(toRecord);
}

// 안무별 최고 점수 조회
export async function getBestScore(
  userId: string,
  choreographyId: string
): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('practice_sessions')
    .select('total_score')
    .eq('user_id', userId)
    .eq('choreography_id', choreographyId)
    .order('total_score', { ascending: false })
    .limit(1)
    .returns<{ total_score: number }[]>()
    .single();

  if (error || !data) return null;
  return data.total_score;
}

// 연속 연습일 계산
export async function getStreak(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('practice_sessions')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<{ created_at: string }[]>();

  if (error || !data || data.length === 0) return 0;

  // 날짜를 YYYY-MM-DD 기준으로 중복 제거 후 내림차순 정렬
  const uniqueDays = [
    ...new Set(
      data.map((r) => {
        const d = new Date(r.created_at);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    ),
  ]
    .map((key) => {
      const [year, month, date] = key.split('-').map(Number);
      return new Date(year, month, date).getTime();
    })
    .sort((a, b) => b - a);

  const today = new Date();
  const todayKey = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const ONE_DAY = 24 * 60 * 60 * 1000;

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
