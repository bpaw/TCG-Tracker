# Repository Layer Architecture

This directory contains the storage layer abstraction for the TCG Tracker app, allowing multiple storage implementations (AsyncStorage, SQLite, Cloud) behind a unified interface.

## Architecture Overview

```
repository/
├── interfaces.ts           # Core repository interfaces (CRUD operations)
├── config.ts              # Storage configuration management
├── factory.ts             # Repository factory with registry pattern
├── asyncstorage/          # AsyncStorage implementation
│   ├── AsyncStorageEventRepository.ts
│   ├── AsyncStorageMatchRepository.ts
│   └── AsyncStorageDeckRepository.ts
├── sqlite/                # SQLite implementation
│   ├── database.ts        # Database connection and initialization
│   ├── schema.ts          # Table schemas and migrations
│   ├── SQLiteEventRepository.ts
│   ├── SQLiteMatchRepository.ts
│   └── SQLiteDeckRepository.ts
└── cloud/                 # Cloud implementation (stubs)
    ├── CloudEventRepository.ts
    ├── CloudMatchRepository.ts
    └── CloudDeckRepository.ts
```

## Repository Registry Pattern

The factory uses a registry pattern to map entity types to storage implementations:

```typescript
REPOSITORY_REGISTRY: {
  event: {
    asyncstorage: AsyncStorageEventRepository,
    sqlite: SQLiteEventRepository,
    cloud: CloudEventRepository
  },
  match: { ... },
  deck: { ... }
}
```

This allows for:
- Easy registration of new storage implementations
- Type-safe lookups
- Centralized configuration
- No switch/if statements for implementation selection

## Key Concepts

### Repository Interface

All repository implementations must implement the `Repository<T>` interface:

```typescript
interface Repository<T> {
  list(filters?: any): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}
```

### Storage Types

- **AsyncStorage** (default): Local storage using React Native AsyncStorage
- **SQLite**: Local SQLite database with indexed queries
- **Cloud**: Future cloud sync implementation (currently stubbed)

## Usage

### Using Default Storage (AsyncStorage)

The app uses AsyncStorage by default. No configuration needed:

```typescript
import * as EventRepo from '../data/eventRepo';

// This automatically uses AsyncStorage
const events = await EventRepo.list();
```

### Switching to SQLite

To use SQLite instead:

```typescript
import { setStorageType } from '../data/repository/config';
import repositoryFactory from '../data/repository/factory';

// Switch to SQLite
setStorageType('sqlite');

// Reset cached repositories to use new implementation
repositoryFactory.reset();

// Now all repo operations use SQLite
const events = await EventRepo.list();
```

### Advanced Configuration

```typescript
import { setRepositoryConfig } from '../data/repository/config';

// SQLite with custom config
setRepositoryConfig({
  type: 'sqlite',
  sqlite: {
    databaseName: 'custom.db',
    version: 2,
  },
});

// Cloud with endpoint (when implemented)
setRepositoryConfig({
  type: 'cloud',
  cloud: {
    endpoint: 'https://api.example.com',
    apiKey: 'your-api-key',
  },
});
```

## Implementation Details

### AsyncStorage

- **Pros**: Simple, no setup required, works out of the box
- **Cons**: No indexing, slower queries on large datasets, no complex filtering
- **Use case**: Development, small datasets, offline-only apps

### SQLite

- **Pros**: Fast queries with indexes, supports complex filtering, relational data
- **Cons**: Requires expo-sqlite, needs schema migrations
- **Use case**: Production apps with larger datasets

Features:
- Indexed queries on common fields (date, game, etc.)
- Foreign key constraints
- Automatic calendar index for date-based lookups
- Schema versioning with migrations

### Cloud (Stub)

- **Status**: Not implemented - all methods throw errors
- **Future**: Will sync data with remote server
- **Use case**: Multi-device sync, backups, social features

## Seed Data

The seed data script (`src/data/seed.ts`) works with both AsyncStorage and SQLite automatically by using the unified repository interfaces.

The APP_META flag (tracks whether seeding has occurred) is stored in AsyncStorage regardless of the main storage type, as it's just a simple flag.

## Calendar Integration

Both AsyncStorage and SQLite implementations maintain a calendar index for efficient date-based lookups:

- **AsyncStorage**: Uses `calendarRepo.ts` with AsyncStorage
- **SQLite**: Uses dedicated `calendar` table with indexes

## Migration Path

To migrate from AsyncStorage to SQLite:

1. Export data from AsyncStorage
2. Switch storage type to SQLite
3. Import data using repository methods
4. Verify data integrity

## Testing

Test with different storage types:

```typescript
// Test AsyncStorage
setStorageType('asyncstorage');
// Run tests...

// Test SQLite
setStorageType('sqlite');
// Run tests...
```

## Extending the Registry

To add a new storage implementation:

1. **Create the repository class**:
```typescript
// src/data/repository/newstorage/NewStorageEventRepository.ts
export class NewStorageEventRepository implements Repository<Event> {
  async list() { /* implementation */ }
  async get(id: string) { /* implementation */ }
  async create(data) { /* implementation */ }
  async update(id, data) { /* implementation */ }
  async remove(id) { /* implementation */ }
}
```

2. **Register it in the factory**:
```typescript
import { REPOSITORY_REGISTRY } from './data/repository/factory';
import { NewStorageEventRepository } from './newstorage/NewStorageEventRepository';

// Register for events
REPOSITORY_REGISTRY.event.newstorage = NewStorageEventRepository;
```

3. **Add storage type to config** (if it's a new storage type):
```typescript
// Update StorageType in interfaces.ts
export type StorageType = 'asyncstorage' | 'sqlite' | 'cloud' | 'newstorage';
```

4. **Use it**:
```typescript
setStorageType('newstorage');
repositoryFactory.reset();
```

## Future Enhancements

- [ ] Data migration utilities (AsyncStorage → SQLite)
- [ ] Cloud implementation with API integration
- [ ] Offline sync queue for Cloud
- [ ] Encryption support for sensitive data
- [ ] Backup/restore functionality
- [ ] Query builder for complex filters
- [ ] Dynamic registry registration at runtime
