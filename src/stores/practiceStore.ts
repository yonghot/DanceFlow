import { create } from 'zustand';
import type {
  PracticeState,
  Grade,
  BodyPartScore,
  PoseFrame,
  Choreography,
} from '@/types';

interface PracticeStore {
  state: PracticeState;
  currentScore: number;
  currentGrade: Grade | null;
  bodyPartScores: BodyPartScore[];
  recordedPoses: PoseFrame[];
  selectedChoreography: Choreography | null;
  setState: (state: PracticeState) => void;
  setScore: (score: number) => void;
  setGrade: (grade: Grade) => void;
  setBodyPartScores: (scores: BodyPartScore[]) => void;
  addPoseFrame: (frame: PoseFrame) => void;
  setSelectedChoreography: (choreo: Choreography | null) => void;
  reset: () => void;
}

const initialState = {
  state: 'idle' as PracticeState,
  currentScore: 0,
  currentGrade: null,
  bodyPartScores: [],
  recordedPoses: [],
  selectedChoreography: null,
};

export const usePracticeStore = create<PracticeStore>((set) => ({
  ...initialState,

  setState: (state: PracticeState): void => {
    set({ state });
  },

  setScore: (score: number): void => {
    set({ currentScore: score });
  },

  setGrade: (grade: Grade): void => {
    set({ currentGrade: grade });
  },

  setBodyPartScores: (scores: BodyPartScore[]): void => {
    set({ bodyPartScores: scores });
  },

  addPoseFrame: (frame: PoseFrame): void => {
    set((prev) => ({
      recordedPoses: [...prev.recordedPoses, frame],
    }));
  },

  setSelectedChoreography: (choreo: Choreography | null): void => {
    set({ selectedChoreography: choreo });
  },

  reset: (): void => {
    set({ ...initialState });
  },
}));
