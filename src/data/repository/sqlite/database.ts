import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION, MIGRATION_V1_TO_V2 } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize and get the SQLite database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('mytcgtracker.db');

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Check schema version and migrate if needed
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );

  const currentVersion = result?.user_version || 0;

  if (currentVersion === 0) {
    // New database - create all tables
    await initializeSchema();
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  } else if (currentVersion < SCHEMA_VERSION) {
    // Existing database - run migrations
    await runMigrations(currentVersion);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }

  return db;
}

/**
 * Initialize database schema (for new databases)
 */
async function initializeSchema(): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  console.log('Initializing SQLite schema...');
  await db.execAsync(CREATE_TABLES);
  console.log('SQLite schema initialized');
}

/**
 * Run database migrations
 */
async function runMigrations(fromVersion: number): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  console.log(`Migrating database from version ${fromVersion} to ${SCHEMA_VERSION}`);

  // Run migrations sequentially
  if (fromVersion < 2) {
    console.log('Running migration v1 -> v2: Adding user_id columns');
    await db.execAsync(MIGRATION_V1_TO_V2);
  }

  console.log('Database migration completed');
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/**
 * Execute a raw SQL query (for testing/debugging)
 */
export async function executeRaw(sql: string): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(sql);
}
