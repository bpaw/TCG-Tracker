import AsyncStorage from '@react-native-async-storage/async-storage';
import { RepositoryConfig, StorageType } from './interfaces';
import repositoryFactory from './factory';

const STORAGE_TYPE_KEY = '@storage_type';

/**
 * Global repository configuration
 * Default to SQLite for better performance and indexed queries
 */
let currentConfig: RepositoryConfig = {
  type: 'sqlite',
};

/**
 * Initialize config by loading persisted storage preference
 */
export async function initializeConfig(): Promise<void> {
  try {
    const storedType = await AsyncStorage.getItem(STORAGE_TYPE_KEY);
    if (storedType && (storedType === 'asyncstorage' || storedType === 'sqlite' || storedType === 'cloud')) {
      currentConfig.type = storedType as StorageType;
      console.log(`[Config] Loaded storage type from persistence: ${storedType}`);
    } else {
      console.log('[Config] No stored preference, using default: sqlite');
    }
  } catch (error) {
    console.error('[Config] Failed to load storage preference:', error);
  }
}

/**
 * Get current repository configuration
 */
export function getRepositoryConfig(): RepositoryConfig {
  return currentConfig;
}

/**
 * Set repository configuration
 */
export function setRepositoryConfig(config: RepositoryConfig): void {
  currentConfig = config;
}

/**
 * Get current storage type
 */
export function getStorageType(): StorageType {
  return currentConfig.type;
}

/**
 * Set storage type (convenience method)
 * Persists the preference and resets repository factory
 */
export async function setStorageType(type: StorageType): Promise<void> {
  try {
    // Update in-memory config
    currentConfig = { ...currentConfig, type };

    // Persist to AsyncStorage
    await AsyncStorage.setItem(STORAGE_TYPE_KEY, type);
    console.log(`[Config] Storage type set to: ${type}`);

    // Reset repository factory to create new instances with new storage type
    repositoryFactory.reset();
  } catch (error) {
    console.error('[Config] Failed to persist storage type:', error);
    throw error;
  }
}
