import type { PoseFrame, Landmark, CompactPoseData } from '@/types';

const DECIMAL_PLACES = 4;
const MULTIPLIER = Math.pow(10, DECIMAL_PLACES);

// 소수점 제한 (용량 절감)
function round(n: number): number {
  return Math.round(n * MULTIPLIER) / MULTIPLIER;
}

// PoseFrame[] → CompactPoseData (키 제거, 소수점 4자리)
export function compactPoseFrames(frames: PoseFrame[]): CompactPoseData {
  if (frames.length === 0) {
    return { timestamps: [], landmarks: [], landmarkCount: 0 };
  }

  const landmarkCount = frames[0].landmarks.length;
  const timestamps: number[] = [];
  const landmarks: number[][] = [];

  for (const frame of frames) {
    timestamps.push(round(frame.timestamp));

    // 프레임당 [x0,y0,z0,v0, x1,y1,z1,v1, ...] 플랫 배열
    const flat: number[] = new Array(frame.landmarks.length * 4);
    for (let i = 0; i < frame.landmarks.length; i++) {
      const lm = frame.landmarks[i];
      const offset = i * 4;
      flat[offset] = round(lm.x);
      flat[offset + 1] = round(lm.y);
      flat[offset + 2] = round(lm.z);
      flat[offset + 3] = round(lm.visibility);
    }
    landmarks.push(flat);
  }

  return { timestamps, landmarks, landmarkCount };
}

// CompactPoseData → PoseFrame[]
export function expandPoseFrames(data: CompactPoseData): PoseFrame[] {
  const frames: PoseFrame[] = [];

  for (let i = 0; i < data.timestamps.length; i++) {
    const flat = data.landmarks[i];
    const landmarks: Landmark[] = [];

    for (let j = 0; j < data.landmarkCount; j++) {
      const offset = j * 4;
      landmarks.push({
        x: flat[offset],
        y: flat[offset + 1],
        z: flat[offset + 2],
        visibility: flat[offset + 3],
      });
    }

    frames.push({ timestamp: data.timestamps[i], landmarks });
  }

  return frames;
}

// JSON → gzip 압축 (Uint8Array)
export async function compressToGzip(data: CompactPoseData): Promise<Uint8Array> {
  const json = JSON.stringify(data);
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(json);

  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(inputBytes);
  writer.close();

  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.byteLength;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}

// gzip → CompactPoseData 복원
export async function decompressFromGzip(compressed: Uint8Array): Promise<CompactPoseData> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(compressed as unknown as BufferSource);
  writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.byteLength;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const decoder = new TextDecoder();
  const json = decoder.decode(result);
  return JSON.parse(json) as CompactPoseData;
}
