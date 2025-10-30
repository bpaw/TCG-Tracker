import { create } from 'zustand';
import { StorageType } from '../data/repository/interfaces';
import { getStorageType, setStorageType } from '../data/repository/config';

interface StorageState {
  storageType: StorageType;
  isChangingStorage: boolean;
  loadStorageType: () => void;
  setStorageTypeAsync: (type: StorageType) => Promise<void>;
}

export const useStorageStore = create<StorageState>((set, get) => ({
  storageType: 'sqlite', // Default value

  isChangingStorage: false,

  /**
   * Load current storage type from config
   */
  loadStorageType: () => {
    const currentType = getStorageType();
    set({ storageType: currentType });
  },

  /**
   * Change storage type and persist
   */
  setStorageTypeAsync: async (type: StorageType) => {
    try {
      set({ isChangingStorage: true });

      // Update config (persists to AsyncStorage and resets factory)
      await setStorageType(type);

      // Update store state
      set({ storageType: type, isChangingStorage: false });

      console.log(`[StorageStore] Storage type changed to: ${type}`);
    } catch (error) {
      console.error('[StorageStore] Failed to change storage type:', error);
      set({ isChangingStorage: false });
      throw error;
    }
  },
}));
