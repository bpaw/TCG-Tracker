/**
 * SQLite database schema and migrations
 */

export const SCHEMA_VERSION = 1;

/**
 * SQL statements to create all tables
 */
export const CREATE_TABLES = `
  -- Events table
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
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
  CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
  CREATE INDEX IF NOT EXISTS idx_matches_eventId ON matches(eventId);
  CREATE INDEX IF NOT EXISTS idx_matches_game ON matches(game);
  CREATE INDEX IF NOT EXISTS idx_matches_deckId ON matches(myDeckId);
  CREATE INDEX IF NOT EXISTS idx_decks_game ON decks(game);
  CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar(date);
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
