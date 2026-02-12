import { createClient } from '@/lib/supabase/client';
import type { CompactPoseData } from '@/types';
import { compressToGzip, decompressFromGzip } from '@/lib/pose/compression';

const BUCKET = 'danceflow-poses';

// 포즈 데이터 업로드 (gzip 압축 → Storage)
export async function uploadPoseData(
  data: CompactPoseData,
  path: string
): Promise<string | null> {
  const supabase = createClient();
  const compressed = await compressToGzip(data);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      contentType: 'application/gzip',
      upsert: false,
    });

  if (error) {
    console.error('포즈 데이터 업로드 실패:', error.message);
    return null;
  }

  return path;
}

// 포즈 데이터 다운로드 (Storage → gzip 해제)
export async function downloadPoseData(
  path: string
): Promise<CompactPoseData | null> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(path);

  if (error || !data) {
    console.error('포즈 데이터 다운로드 실패:', error?.message);
    return null;
  }

  const arrayBuffer = await data.arrayBuffer();
  const compressed = new Uint8Array(arrayBuffer);

  return decompressFromGzip(compressed);
}
