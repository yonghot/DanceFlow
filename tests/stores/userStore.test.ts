import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types';

describe('userStore', () => {
  beforeEach(() => {
    const store = useUserStore.getState();
    store.setOnboarded(false);
    useUserStore.setState({ user: null, isOnboarded: false });
  });

  it('초기 상태', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.isOnboarded).toBe(false);
  });

  it('setUser로 사용자 설정 시 isOnboarded도 true', () => {
    const user: User = {
      id: 'test-1',
      nickname: '댄서',
      createdAt: new Date(),
      settings: {
        nickname: '댄서',
        mirrorMode: true,
        playbackSpeed: 1,
      },
    };
    useUserStore.getState().setUser(user);
    const state = useUserStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isOnboarded).toBe(true);
  });

  it('updateSettings로 설정 부분 업데이트', () => {
    const user: User = {
      id: 'test-1',
      nickname: '댄서',
      createdAt: new Date(),
      settings: {
        nickname: '댄서',
        mirrorMode: true,
        playbackSpeed: 1,
      },
    };
    useUserStore.getState().setUser(user);
    useUserStore.getState().updateSettings({ mirrorMode: false });

    const updated = useUserStore.getState().user;
    expect(updated?.settings.mirrorMode).toBe(false);
    expect(updated?.settings.playbackSpeed).toBe(1);
  });

  it('user가 null일 때 updateSettings 호출해도 안전', () => {
    useUserStore.setState({ user: null });
    useUserStore.getState().updateSettings({ mirrorMode: false });
    expect(useUserStore.getState().user).toBeNull();
  });

  it('setOnboarded로 온보딩 상태 변경', () => {
    useUserStore.getState().setOnboarded(true);
    expect(useUserStore.getState().isOnboarded).toBe(true);

    useUserStore.getState().setOnboarded(false);
    expect(useUserStore.getState().isOnboarded).toBe(false);
  });
});
