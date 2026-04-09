import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createChapter1Slice } from '@/store/slices/chapter1Slice';
import { createCoreSlice } from '@/store/slices/coreSlice';
import type { Chapter1ObjectiveStage, Chapter1PreparationProgress, GameState } from '@/store/gameStore.types';

export type { Chapter1ObjectiveStage, Chapter1PreparationProgress, GameState };

export const useGameStore = create<GameState>()(
  persist(
    (...args) => ({
      ...createChapter1Slice(...args),
      ...createCoreSlice(...args),
    }),
    {
      name: 'watching-world-save-chapter1',
    }
  )
);

