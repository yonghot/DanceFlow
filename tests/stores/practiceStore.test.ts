import { describe, it, expect, beforeEach } from 'vitest';
import { usePracticeStore } from '@/stores/practiceStore';

describe('practiceStore', () => {
  beforeEach(() => {
    usePracticeStore.getState().reset();
  });

  it('초기 상태가 idle', () => {
    const state = usePracticeStore.getState();
    expect(state.state).toBe('idle');
    expect(state.currentScore).toBe(0);
    expect(state.currentGrade).toBeNull();
    expect(state.bodyPartScores).toEqual([]);
    expect(state.recordedPoses).toEqual([]);
    expect(state.selectedChoreography).toBeNull();
  });

  it('setState로 상태 전환', () => {
    usePracticeStore.getState().setState('countdown');
    expect(usePracticeStore.getState().state).toBe('countdown');

    usePracticeStore.getState().setState('practicing');
    expect(usePracticeStore.getState().state).toBe('practicing');

    usePracticeStore.getState().setState('completed');
    expect(usePracticeStore.getState().state).toBe('completed');
  });

  it('setScore로 점수 설정', () => {
    usePracticeStore.getState().setScore(85);
    expect(usePracticeStore.getState().currentScore).toBe(85);
  });

  it('setGrade로 등급 설정', () => {
    usePracticeStore.getState().setGrade('great');
    expect(usePracticeStore.getState().currentGrade).toBe('great');
  });

  it('setBodyPartScores로 부위별 점수 설정', () => {
    const scores = [
      { part: 'leftArm' as const, score: 90, feedback: 'good' },
    ];
    usePracticeStore.getState().setBodyPartScores(scores);
    expect(usePracticeStore.getState().bodyPartScores).toEqual(scores);
  });

  it('addPoseFrame으로 포즈 추가', () => {
    const frame = {
      timestamp: 100,
      landmarks: [{ x: 0, y: 0, z: 0, visibility: 1 }],
    };
    usePracticeStore.getState().addPoseFrame(frame);
    expect(usePracticeStore.getState().recordedPoses).toHaveLength(1);
    expect(usePracticeStore.getState().recordedPoses[0]).toEqual(frame);

    usePracticeStore.getState().addPoseFrame(frame);
    expect(usePracticeStore.getState().recordedPoses).toHaveLength(2);
  });

  it('setSelectedChoreography로 안무 선택', () => {
    const choreo = {
      id: 'test',
      title: 'Test',
      artist: 'Artist',
      difficulty: 'beginner' as const,
      duration: 30,
      referencePoses: [],
      thumbnailUrl: '',
    };
    usePracticeStore.getState().setSelectedChoreography(choreo);
    expect(usePracticeStore.getState().selectedChoreography).toEqual(choreo);
  });

  it('reset으로 초기 상태 복원', () => {
    usePracticeStore.getState().setState('practicing');
    usePracticeStore.getState().setScore(90);
    usePracticeStore.getState().setGrade('great');
    usePracticeStore.getState().reset();

    const state = usePracticeStore.getState();
    expect(state.state).toBe('idle');
    expect(state.currentScore).toBe(0);
    expect(state.currentGrade).toBeNull();
  });
});
