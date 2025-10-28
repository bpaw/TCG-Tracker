import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@theme_mode';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggleTheme: async () => {
    const newValue = !get().isDark;
    set({ isDark: newValue });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  },

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== null) {
        set({ isDark: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  },
}));
