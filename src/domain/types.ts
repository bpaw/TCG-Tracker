type ID = string;

export type GameTitle =
  | 'Magic: The Gathering'
  | 'Pokémon'
  | 'Yu-Gi-Oh!'
  | 'Flesh and Blood'
  | 'Lorcana'
  | 'One Piece'
  | 'Other';

export interface Deck {
  id: ID;
  title: string;       // "Golgari Midrange"
  game: GameTitle;
  notes?: string;
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
  archived?: boolean;
}

export type MatchResult = 'WIN' | 'LOSS' | 'TIE';
export type StartChoice = 'FIRST' | 'SECOND' | 'UNKNOWN';

export interface Event {
  id: ID;
  name: string;            // "FNM - Modern", "Prerelease"
  game: GameTitle;
  date: string;            // ISO
  totalRounds: number;     // Dynamic number of rounds
  notes?: string;
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
}

export interface Match {
  id: ID;
  date: string;            // ISO
  game: GameTitle;

  // Event tracking (REQUIRED - matches always belong to an event)
  eventId: ID;             // reference to Event
  roundNumber: number;     // 1, 2, 3, etc.

  myDeckId: ID;            // must reference a Deck
  oppDeckArchetype: string;
  opponentName?: string;

  result: MatchResult;
  score?: '2-0' | '2-1' | '1-2' | '0-2' | '1-1-1' | string;
  wonDieRoll?: boolean;
  started?: StartChoice;
  startTurnNumber?: number;

  notes?: string;
  tags?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface AppMeta {
  seeded: boolean;
  version: string;
}
