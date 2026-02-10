import { describe, it, expect, beforeEach } from 'vitest';
import { usePoseStore } from '@/stores/poseStore';

describe('poseStore', () => {
  beforeEach(() => {
    usePoseStore.getState().reset();
  });

  it('초기 상태', () => {
    const state = usePoseStore.getState();
    expect(state.isDetectorReady).toBe(false);
    expect(state.isDetecting).toBe(false);
    expect(state.currentPose).toBeNull();
    expect(state.fps).toBe(0);
  });

  it('setDetectorReady', () => {
    usePoseStore.getState().setDetectorReady(true);
    expect(usePoseStore.getState().isDetectorReady).toBe(true);
  });

  it('setDetecting', () => {
    usePoseStore.getState().setDetecting(true);
    expect(usePoseStore.getState().isDetecting).toBe(true);
  });

  it('setCurrentPose', () => {
    const pose = [{ x: 1, y: 2, z: 3, visibility: 1 }];
    usePoseStore.getState().setCurrentPose(pose);
    expect(usePoseStore.getState().currentPose).toEqual(pose);
  });

  it('setFps', () => {
    usePoseStore.getState().setFps(30);
    expect(usePoseStore.getState().fps).toBe(30);
  });

  it('reset으로 초기 상태 복원', () => {
    usePoseStore.getState().setDetectorReady(true);
    usePoseStore.getState().setDetecting(true);
    usePoseStore.getState().setFps(60);
    usePoseStore.getState().reset();

    const state = usePoseStore.getState();
    expect(state.isDetectorReady).toBe(false);
    expect(state.isDetecting).toBe(false);
    expect(state.fps).toBe(0);
  });
});
