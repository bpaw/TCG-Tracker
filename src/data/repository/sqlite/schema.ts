/**
 * SQLite database schema and migrations
 */

export const SCHEMA_VERSION = 2;

/**
 * SQL statements to create all tables
 * NOTE: user_id is optional (NULL) to support both authenticated and local-only usage
 */
export const CREATE_TABLES = `
  -- Events table
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    game TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    totalRounds INTEGER NOT NULL,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  -- Matches table
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    eventId TEXT,
    game TEXT NOT NULL,
    myDeckId TEXT,
    oppDeckArchetype TEXT NOT NULL,
    opponentName TEXT,
    result TEXT NOT NULL,
    score TEXT,
    wonDieRoll INTEGER,
    started TEXT,
    onThePlay INTEGER,
    roundNumber INTEGER NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    onePieceLeader TEXT,
    onePieceColor TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL
  );

  -- Decks table
  CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    title TEXT NOT NULL,
    game TEXT NOT NULL,
    archetype TEXT,
    colors TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  -- Calendar index table
  CREATE TABLE IF NOT EXISTS calendar (
    date TEXT NOT NULL,
    eventId TEXT,
    matchId TEXT,
    PRIMARY KEY (date, eventId, matchId)
  );

  -- Create indices for better query performance
  CREATE INDEX IF NOT EXISTS idx_events_startDate ON events(startDate);
  CREATE INDEX IF NOT EXISTS idx_events_game ON events(game);
  CREATE INDEX IF NOT EXISTS idx_events_userId ON events(user_id);
  CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
  CREATE INDEX IF NOT EXISTS idx_matches_eventId ON matches(eventId);
  CREATE INDEX IF NOT EXISTS idx_matches_game ON matches(game);
  CREATE INDEX IF NOT EXISTS idx_matches_deckId ON matches(myDeckId);
  CREATE INDEX IF NOT EXISTS idx_matches_userId ON matches(user_id);
  CREATE INDEX IF NOT EXISTS idx_decks_game ON decks(game);
  CREATE INDEX IF NOT EXISTS idx_decks_userId ON decks(user_id);
  CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar(date);
`;

/**
 * Migration from version 1 to version 2
 * Adds user_id column to existing tables
 */
export const MIGRATION_V1_TO_V2 = `
  -- Add user_id column to events table
  ALTER TABLE events ADD COLUMN user_id TEXT;

  -- Add user_id column to matches table
  ALTER TABLE matches ADD COLUMN user_id TEXT;

  -- Add user_id column to decks table
  ALTER TABLE decks ADD COLUMN user_id TEXT;

  -- Create new indices for user_id
  CREATE INDEX IF NOT EXISTS idx_events_userId ON events(user_id);
  CREATE INDEX IF NOT EXISTS idx_matches_userId ON matches(user_id);
  CREATE INDEX IF NOT EXISTS idx_decks_userId ON decks(user_id);
`;

/**
 * Drop all tables (for testing/reset)
 */
export const DROP_TABLES = `
  DROP TABLE IF EXISTS calendar;
  DROP TABLE IF EXISTS matches;
  DROP TABLE IF EXISTS decks;
  DROP TABLE IF EXISTS events;
`;
