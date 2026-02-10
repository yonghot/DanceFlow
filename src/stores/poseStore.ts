import { create } from 'zustand';
import type { Landmark } from '@/types';

interface PoseStore {
  isDetectorReady: boolean;
  isDetecting: boolean;
  currentPose: Landmark[] | null;
  fps: number;
  setDetectorReady: (ready: boolean) => void;
  setDetecting: (detecting: boolean) => void;
  setCurrentPose: (pose: Landmark[] | null) => void;
  setFps: (fps: number) => void;
  reset: () => void;
}

const initialState = {
  isDetectorReady: false,
  isDetecting: false,
  currentPose: null,
  fps: 0,
} as const;

export const usePoseStore = create<PoseStore>((set) => ({
  ...initialState,

  setDetectorReady: (ready: boolean): void => {
    set({ isDetectorReady: ready });
  },

  setDetecting: (detecting: boolean): void => {
    set({ isDetecting: detecting });
  },

  setCurrentPose: (pose: Landmark[] | null): void => {
    set({ currentPose: pose });
  },

  setFps: (fps: number): void => {
    set({ fps });
  },

  reset: (): void => {
    set({ ...initialState });
  },
}));
