import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserSettings } from '@/types';

interface UserStore {
  user: User | null;
  isOnboarded: boolean;
  setUser: (user: User) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setOnboarded: (value: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,

      setUser: (user: User): void => {
        set({ user, isOnboarded: true });
      },

      updateSettings: (settings: Partial<UserSettings>): void => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              settings: {
                ...state.user.settings,
                ...settings,
              },
            },
          };
        });
      },

      setOnboarded: (value: boolean): void => {
        set({ isOnboarded: value });
      },
    }),
    {
      name: 'danceflow-user',
    }
  )
);
