import { RepositoryConfig, StorageType } from './interfaces';

/**
 * Global repository configuration
 * Default to AsyncStorage for backwards compatibility
 */
let currentConfig: RepositoryConfig = {
  type: 'asyncstorage',
};

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
 */
export function setStorageType(type: StorageType): void {
  currentConfig = { ...currentConfig, type };
}
