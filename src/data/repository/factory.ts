import { Event, Match, Deck } from '../../domain/types';
import { Repository, StorageType } from './interfaces';
import { getStorageType } from './config';

// AsyncStorage implementations
import { AsyncStorageEventRepository } from './asyncstorage/AsyncStorageEventRepository';
import { AsyncStorageMatchRepository, MatchFilters as AsyncMatchFilters } from './asyncstorage/AsyncStorageMatchRepository';
import { AsyncStorageDeckRepository, DeckFilters as AsyncDeckFilters } from './asyncstorage/AsyncStorageDeckRepository';

// SQLite implementations
import { SQLiteEventRepository } from './sqlite/SQLiteEventRepository';
import { SQLiteMatchRepository, MatchFilters as SQLiteMatchFilters } from './sqlite/SQLiteMatchRepository';
import { SQLiteDeckRepository, DeckFilters as SQLiteDeckFilters } from './sqlite/SQLiteDeckRepository';

// Cloud implementations (stubs)
import { CloudEventRepository } from './cloud/CloudEventRepository';
import { CloudMatchRepository } from './cloud/CloudMatchRepository';
import { CloudDeckRepository } from './cloud/CloudDeckRepository';

// Export filter types
export type MatchFilters = AsyncMatchFilters | SQLiteMatchFilters;
export type DeckFilters = AsyncDeckFilters | SQLiteDeckFilters;

/**
 * Entity type enum for registry keys
 */
export type EntityType = 'event' | 'match' | 'deck';

/**
 * Repository constructor type
 */
export type RepositoryConstructor<T> = new () => Repository<T>;

/**
 * Repository registry - maps entity types to storage implementations
 * Structure: EntityType -> StorageType -> Repository Constructor
 *
 * To add a new storage implementation:
 * 1. Create the repository class implementing Repository<T>
 * 2. Add it to the appropriate entity's storage type mapping
 *
 * Example:
 *   REPOSITORY_REGISTRY.event.newstorage = NewStorageEventRepository;
 */
export const REPOSITORY_REGISTRY: Record<EntityType, Record<StorageType, RepositoryConstructor<any>>> = {
  event: {
    asyncstorage: AsyncStorageEventRepository,
    sqlite: SQLiteEventRepository,
    cloud: CloudEventRepository,
  },
  match: {
    asyncstorage: AsyncStorageMatchRepository,
    sqlite: SQLiteMatchRepository,
    cloud: CloudMatchRepository,
  },
  deck: {
    asyncstorage: AsyncStorageDeckRepository,
    sqlite: SQLiteDeckRepository,
    cloud: CloudDeckRepository,
  },
};

/**
 * Repository factory - creates appropriate repository implementation based on configuration
 */
class RepositoryFactory {
  private eventRepo: Repository<Event> | null = null;
  private matchRepo: Repository<Match> | null = null;
  private deckRepo: Repository<Deck> | null = null;

  /**
   * Get Event repository
   */
  getEventRepository(): Repository<Event> {
    if (!this.eventRepo) {
      this.eventRepo = this.createRepository<Event>('event');
    }
    return this.eventRepo;
  }

  /**
   * Get Match repository
   */
  getMatchRepository(): Repository<Match> {
    if (!this.matchRepo) {
      this.matchRepo = this.createRepository<Match>('match');
    }
    return this.matchRepo;
  }

  /**
   * Get Deck repository
   */
  getDeckRepository(): Repository<Deck> {
    if (!this.deckRepo) {
      this.deckRepo = this.createRepository<Deck>('deck');
    }
    return this.deckRepo;
  }

  /**
   * Create a repository instance from the registry
   */
  private createRepository<T>(entityType: EntityType): Repository<T> {
    const storageType = getStorageType();
    const entityRegistry = REPOSITORY_REGISTRY[entityType];

    if (!entityRegistry) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const RepositoryClass = entityRegistry[storageType];

    if (!RepositoryClass) {
      throw new Error(`No implementation found for ${entityType} with storage type: ${storageType}`);
    }

    return new RepositoryClass();
  }

  /**
   * Reset all cached repository instances (useful when changing storage type)
   */
  reset(): void {
    this.eventRepo = null;
    this.matchRepo = null;
    this.deckRepo = null;
  }
}

// Singleton instance
const repositoryFactory = new RepositoryFactory();

export default repositoryFactory;
