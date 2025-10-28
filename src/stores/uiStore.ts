import { create } from 'zustand';
import { checkAndSeedIfNeeded } from '../data/seed';

interface UiState {
  initialized: boolean;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;

  // Actions
  initialize: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  initialized: false,
  toast: null,

  initialize: async () => {
    try {
      await checkAndSeedIfNeeded();
      set({ initialized: true });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ initialized: true }); // Still mark as initialized to avoid blocking
    }
  },

  showToast: (message, type = 'info') => {
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toast: state.toast ? { ...state.toast, visible: false } : null,
      }));
    }, 3000);
  },

  hideToast: () => {
    set({ toast: null });
  },
}));
