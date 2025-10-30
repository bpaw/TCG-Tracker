import { create } from 'zustand';
import { StorageType } from '../data/repository/interfaces';
import { getStorageType, setStorageType } from '../data/repository/config';

interface StorageState {
  storageType: StorageType;
  isChangingStorage: boolean;
  loadStorageType: () => void;
  setStorageTypeAsync: (type: StorageType, options?: { refreshStores?: boolean }) => Promise<void>;
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
   *
   * @param type - The storage type to switch to
   * @param options.refreshStores - If true, refreshes all Zustand stores after switching (default: true)
   */
  setStorageTypeAsync: async (type: StorageType, options = { refreshStores: true }) => {
    try {
      set({ isChangingStorage: true });

      // Update config (persists to AsyncStorage and resets factory)
      await setStorageType(type);

      // Update store state
      set({ storageType: type, isChangingStorage: false });

      console.log(`[StorageStore] Storage type changed to: ${type}`);

      // Refresh all stores to load data from new storage
      if (options.refreshStores) {
        console.log('[StorageStore] Refreshing all stores with new storage data...');

        // Dynamically import stores to avoid circular dependencies
        const { useEventStore } = await import('./eventStore');
        const { useMatchStore } = await import('./matchStore');
        const { useDeckStore } = await import('./deckStore');

        // Refresh all stores in parallel
        await Promise.all([
          useEventStore.getState().loadEvents(),
          useMatchStore.getState().loadMatches(),
          useDeckStore.getState().loadDecks(),
        ]);

        console.log('[StorageStore] All stores refreshed successfully');
      }
    } catch (error) {
      console.error('[StorageStore] Failed to change storage type:', error);
      set({ isChangingStorage: false });
      throw error;
    }
  },
}));
