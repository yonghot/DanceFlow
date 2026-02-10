import { type Landmark } from '@/types';

/** 포즈 감지 결과 */
export interface PoseDetectionResult {
  landmarks: Landmark[];
  timestamp: number;
}

/** PoseLandmarker 초기화 설정 */
export interface PoseDetectorConfig {
  modelPath?: string;
  numPoses?: number;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

/** 카메라 설정 */
export interface CameraConfig {
  width: number;
  height: number;
  facingMode: string;
}
