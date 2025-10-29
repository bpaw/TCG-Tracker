/**
 * Core repository interfaces for storage layer abstraction
 */

/**
 * Base CRUD repository interface
 */
export interface Repository<T, TCreate = Omit<T, 'id' | 'createdAt' | 'updatedAt'>> {
  /**
   * List all entities, optionally with filters
   */
  list(filters?: any): Promise<T[]>;

  /**
   * Get a single entity by ID
   */
  get(id: string): Promise<T | null>;

  /**
   * Create a new entity
   */
  create(data: TCreate): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Remove an entity
   */
  remove(id: string): Promise<boolean>;
}

/**
 * Repository with index support for efficient lookups
 */
export interface IndexableRepository<T, TCreate = Omit<T, 'id' | 'createdAt' | 'updatedAt'>> extends Repository<T, TCreate> {
  /**
   * Create or update an index entry
   */
  addToIndex?(indexName: string, key: string, entityId: string): Promise<void>;

  /**
   * Remove from an index
   */
  removeFromIndex?(indexName: string, key: string, entityId: string): Promise<void>;

  /**
   * Query by index
   */
  queryByIndex?(indexName: string, key: string): Promise<T[]>;
}

/**
 * Storage type enumeration
 */
export type StorageType = 'asyncstorage' | 'sqlite' | 'cloud';

/**
 * Repository configuration
 */
export interface RepositoryConfig {
  type: StorageType;
  // SQLite specific config
  sqlite?: {
    databaseName: string;
    version: number;
  };
  // Cloud specific config
  cloud?: {
    endpoint: string;
    apiKey?: string;
  };
}
