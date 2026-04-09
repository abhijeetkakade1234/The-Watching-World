import type { StateCreator } from 'zustand';
import type { CoreActions, GameState } from '@/store/gameStore.types';

export const createCoreSlice: StateCreator<GameState, [], [], CoreActions> = (set, get) => ({
  togglePause: () => {
    const state = get();
    if (state.status === 'playing') set({ status: 'paused' });
    else if (state.status === 'paused') set({ status: 'playing' });
  },

  toggleMap: () => {
    const state = get();
    if (state.hasMiniMap) set({ isMiniMapOpen: !state.isMiniMapOpen });
  },

  toggleMusic: () => {
    const state = get();
    set({ isMusicEnabled: !state.isMusicEnabled });
  },
});

