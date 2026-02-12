import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ReferenceRow = Database['public']['Tables']['reference_poses']['Row'];

export interface ReferenceInfo {
  id: string;
  choreographyId: string;
  recorderId: string;
  poseDataUrl: string;
  frameCount: number;
  durationMs: number;
  status: 'processing' | 'active' | 'archived';
  isPrimary: boolean;
  createdAt: string;
}

function toReferenceInfo(row: ReferenceRow): ReferenceInfo {
  return {
    id: row.id,
    choreographyId: row.choreography_id,
    recorderId: row.recorder_id,
    poseDataUrl: row.pose_data_url,
    frameCount: row.frame_count,
    durationMs: row.duration_ms,
    status: row.status,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

// 레퍼런스 포즈 생성
export async function createReference(params: {
  choreographyId: string;
  recorderId: string;
  poseDataUrl: string;
  frameCount: number;
  durationMs: number;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reference_poses')
    .insert({
      choreography_id: params.choreographyId,
      recorder_id: params.recorderId,
      pose_data_url: params.poseDataUrl,
      frame_count: params.frameCount,
      duration_ms: params.durationMs,
      status: 'active',
    })
    .select('id')
    .returns<{ id: string }[]>()
    .single();

  if (error || !data) return null;
  return data.id;
}

// 안무별 활성 레퍼런스 목록 조회
export async function getActiveReferences(
  choreographyId: string
): Promise<ReferenceInfo[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reference_poses')
    .select('*')
    .eq('choreography_id', choreographyId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .returns<ReferenceRow[]>();

  if (error || !data) return [];
  return data.map(toReferenceInfo);
}

// 안무별 primary 레퍼런스 (또는 최신 active) 조회
export async function getPrimaryReference(
  choreographyId: string
): Promise<ReferenceInfo | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  // primary가 있으면 우선
  const { data: primary } = await supabase
    .from('reference_poses')
    .select('*')
    .eq('choreography_id', choreographyId)
    .eq('status', 'active')
    .eq('is_primary', true)
    .returns<ReferenceRow[]>()
    .limit(1)
    .single();

  if (primary) return toReferenceInfo(primary);

  // 없으면 최신 active
  const { data: latest } = await supabase
    .from('reference_poses')
    .select('*')
    .eq('choreography_id', choreographyId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .returns<ReferenceRow[]>()
    .limit(1)
    .single();

  if (latest) return toReferenceInfo(latest);
  return null;
}

// 레퍼런스 ID로 단건 조회
export async function getReferenceById(
  id: string
): Promise<ReferenceInfo | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reference_poses')
    .select('*')
    .eq('id', id)
    .returns<ReferenceRow[]>()
    .single();

  if (error || !data) return null;
  return toReferenceInfo(data);
}
