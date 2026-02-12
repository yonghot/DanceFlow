import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { Choreography } from '@/types';

type ChoreographyRow = Database['public']['Tables']['choreographies']['Row'];

// DB Row → Choreography 변환
function toChoreography(
  row: ChoreographyRow,
  hasReference: boolean
): Choreography {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    difficulty: row.difficulty,
    duration: row.duration,
    thumbnailUrl: row.thumbnail_url,
    audioUrl: row.audio_url,
    hasReference,
  };
}

// 전체 안무 목록 조회 (레퍼런스 유무 포함)
export async function getChoreographies(): Promise<Choreography[]> {
  const supabase = createClient();

  const { data: choreos, error } = await supabase
    .from('choreographies')
    .select('*')
    .order('created_at', { ascending: true })
    .returns<ChoreographyRow[]>();

  if (error || !choreos) return [];

  // 레퍼런스가 있는 안무 ID 조회
  const { data: refs } = await supabase
    .from('reference_poses')
    .select('choreography_id')
    .eq('status', 'active')
    .returns<{ choreography_id: string }[]>();

  const refSet = new Set((refs ?? []).map((r) => r.choreography_id));

  return choreos.map((row) => toChoreography(row, refSet.has(row.id)));
}

// 안무 ID로 단건 조회
export async function getChoreographyById(
  id: string
): Promise<Choreography | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('choreographies')
    .select('*')
    .eq('id', id)
    .returns<ChoreographyRow[]>()
    .single();

  if (error || !data) return null;

  // 해당 안무의 활성 레퍼런스 존재 여부
  const { count } = await supabase
    .from('reference_poses')
    .select('id', { count: 'exact', head: true })
    .eq('choreography_id', id)
    .eq('status', 'active');

  return toChoreography(data, (count ?? 0) > 0);
}
