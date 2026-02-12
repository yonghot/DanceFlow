import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface Profile {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  settings: {
    mirrorMode: boolean;
    playbackSpeed: number;
  };
}

interface UserStore {
  profile: Profile | null;
  isLoading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'nickname' | 'avatarUrl' | 'settings'>>) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  profile: null,
  isLoading: true,

  fetchProfile: async (userId: string): Promise<void> => {
    set({ isLoading: true });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .returns<ProfileRow[]>()
      .single();

    if (error || !data) {
      set({ profile: null, isLoading: false });
      return;
    }

    set({
      profile: {
        id: data.id,
        nickname: data.nickname,
        avatarUrl: data.avatar_url,
        settings: data.settings as Profile['settings'],
      },
      isLoading: false,
    });
  },

  updateProfile: async (updates): Promise<void> => {
    const { profile } = get();
    if (!profile) return;

    const supabase = createClient();
    const dbUpdates: Record<string, unknown> = {};

    if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.settings !== undefined) {
      dbUpdates.settings = { ...profile.settings, ...updates.settings };
    }

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', profile.id);

    if (!error) {
      set({
        profile: {
          ...profile,
          ...updates,
          settings: updates.settings
            ? { ...profile.settings, ...updates.settings }
            : profile.settings,
        },
      });
    }
  },

  clearUser: (): void => {
    set({ profile: null, isLoading: false });
  },
}));
