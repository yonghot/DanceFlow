import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/stores/userStore';

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState({ profile: null, isLoading: true });
  });

  it('초기 상태', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('clearUser로 프로필 초기화', () => {
    useUserStore.setState({
      profile: {
        id: 'test-1',
        nickname: '댄서',
        avatarUrl: null,
        settings: { mirrorMode: true, playbackSpeed: 1 },
      },
      isLoading: false,
    });

    useUserStore.getState().clearUser();

    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('profile 상태 직접 설정', () => {
    const profile = {
      id: 'test-2',
      nickname: '테스트유저',
      avatarUrl: 'https://example.com/avatar.jpg',
      settings: { mirrorMode: false, playbackSpeed: 1.5 },
    };

    useUserStore.setState({ profile, isLoading: false });

    const state = useUserStore.getState();
    expect(state.profile).toEqual(profile);
    expect(state.profile?.nickname).toBe('테스트유저');
    expect(state.profile?.settings.mirrorMode).toBe(false);
  });
});
