import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { type PoseDetectionResult, type PoseDetectorConfig } from '@/lib/pose/types';
import { type Landmark } from '@/types';

const DEFAULT_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

const DEFAULT_CONFIG: Required<PoseDetectorConfig> = {
  modelPath: DEFAULT_MODEL_PATH,
  numPoses: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

/** MediaPipe PoseLandmarker 래퍼 */
export class PoseDetector {
  private landmarker: PoseLandmarker | null = null;
  private config: Required<PoseDetectorConfig>;

  constructor(config: PoseDetectorConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** PoseLandmarker 초기화 (WASM 로드 + 모델 생성) */
  async initialize(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
    );

    this.landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: this.config.modelPath,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: this.config.numPoses,
      minPoseDetectionConfidence: this.config.minDetectionConfidence,
      minTrackingConfidence: this.config.minTrackingConfidence,
    });
  }

  /** 비디오 프레임에서 포즈 감지 */
  detect(video: HTMLVideoElement, timestamp: number): PoseDetectionResult | null {
    if (!this.landmarker) {
      return null;
    }

    const result: PoseLandmarkerResult = this.landmarker.detectForVideo(
      video,
      timestamp
    );

    if (!result.landmarks || result.landmarks.length === 0) {
      return null;
    }

    const landmarks: Landmark[] = result.landmarks[0].map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility ?? 0,
    }));

    return { landmarks, timestamp };
  }

  /** 리소스 정리 */
  destroy(): void {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
  }
}
