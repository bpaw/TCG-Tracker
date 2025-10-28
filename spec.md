ROLE

You are a senior React Native engineer. Build a weekend-MVP Expo app in TypeScript for tracking TCG matches across multiple games. Must include the concept of Decks (create/select decks), even if only a few are supported for testing. Optimize for fast logging, offline-first, and clear code structure.

OUTPUT FORMAT

Return a complete file tree and all file contents. Include commands to run. Use stable Expo SDK.

SCOPE (WEEKEND MVP)

Screens (4)

Dashboard (recent matches list + quick stats)

Log Match (fast form)

Match History (list + detail)

Decks (list + create/edit; pick a deck when logging)

No Events page, no heavy analytics—just a simple stats block (overall win rate, per-deck win rate, first vs second).

TECH

Expo + React Native (TypeScript)

Navigation: @react-navigation/native (tabs + stack)

State: zustand

Persistence: AsyncStorage (keep it simple for weekend). Put a // TODO: migrate to SQLite note and isolate a Repository layer.

Forms: react-hook-form + zod

UI: RN core + very light components (no big design system)

Utils: date-fns, uuid

Charts: skip for now; show numeric KPIs only

DOMAIN TYPES
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
  title: string;       // “Golgari Midrange”
  game: GameTitle;
  notes?: string;
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
  archived?: boolean;
}

export type MatchResult = 'WIN' | 'LOSS' | 'TIE';
export type StartChoice = 'FIRST' | 'SECOND' | 'UNKNOWN';

export interface Match {
  id: ID;
  date: string;            // ISO
  game: GameTitle;

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

SEED DATA (Decks)

On first run, seed 3 decks across 2 games so the app is usable immediately:

Magic: “Izzet Prowess”, “Golgari Midrange”

Pokémon: “Lost Box”
Also seed ~6 example matches spread across those decks.

REPOSITORY LAYER

Create a thin repository that reads/writes JSON blobs in AsyncStorage:

Keys: decks, matches, appMeta

Functions:

DeckRepo: list(), get(id), create(), update(), archive()

MatchRepo: list(filters?), get(id), create(), update(), remove()

Keep filters simple: { game?, deckId?, dateFrom?, dateTo?, result? }

Implement derived stats helpers:

getOverallRecord(matches)

getWinRate(matches)

getWinRateByDeck(matches, decks)

getFirstVsSecondSplit(matches)

Add // TODO: swap to SQLite later comments and keep repo signatures stable.

SCREENS & UX
1) Dashboard

Header: “New Match” primary button.

Recent Matches (last 10).

KPIs block:

Overall record (e.g., “8–4–1”)

Win rate %

First vs Second win rates (e.g., “First: 62% • Second: 48%”)

If no data, show friendly empty state + “Add your first deck”.

2) Log Match (Form)

Fields (fast, tap-friendly):

Game (select)

Date (default now)

My Deck (select from Decks; required)

Opponent Deck Archetype (free text with recent suggestions)

Opponent Name (optional)

Result (segmented: Win / Loss / Tie)

Score (chips: 2-0, 2-1, 1-2, 0-2, custom)

Won Die Roll? (Yes/No)

Started: First / Second / Unknown

Start Turn Number (numeric, optional)

Notes (multiline)

Tags (comma-separated; optional)

Buttons: Save, Save & New (stays on form)

Validation with zod; only game, myDeckId, result required.

3) Match History

Simple filter row: Game, Deck, Result

Virtualized list; each row shows date, result chip, my deck, opp archetype, score, started, die roll

Match Detail:

Show all fields; actions: Edit, Duplicate (prefills Log Match), Delete (with undo snackbar)

4) Decks

List decks (group by Game). Actions: Add, Edit, Archive toggle.

Create/Edit Deck: title, game, notes.

“Log match with this deck” shortcut opens Log Match with deck preselected.

STATE

zustand stores:

useDeckStore (array of decks, CRUD)

useMatchStore (array of matches, CRUD, filters)

useUiStore (seed-complete flag, theme)

On app start:

Check appMeta.seeded. If false, seed and set true.

ACCESSIBILITY & DX

Larger touch targets (min 44pt), proper labels.

Typesafe navigation params.

Lint + Prettier config.

Minimal unit tests for:

zod schemas (match/deck)

stats helpers (win rate, records)

Error handling: toast/snackbar on repo failures.

FILE TREE (lean)
app.json
package.json
App.tsx
/src
  /domain/types.ts
  /data/asyncStorage.ts
  /data/deckRepo.ts
  /data/matchRepo.ts
  /data/seed.ts
  /stores/deckStore.ts
  /stores/matchStore.ts
  /stores/uiStore.ts
  /navigation/RootNavigator.tsx
  /screens/DashboardScreen.tsx
  /screens/LogMatchScreen.tsx
  /screens/MatchHistoryScreen.tsx
  /screens/MatchDetailScreen.tsx
  /screens/DecksScreen.tsx
  /screens/EditDeckScreen.tsx
  /components/KPI.tsx
  /components/MatchRow.tsx
  /components/FormControls.tsx
  /utils/stats.ts
  /utils/date.ts
  /validation/schemas.ts
README.md

ACCEPTANCE CRITERIA (WEEKEND)

Decks can be created/edited/archived; at least 3 sample decks exist on first run.

Log Match form saves locally; Save & New supports rapid entry.

Match History filters work (Game, Deck, Result) and open Match Detail.

Dashboard shows recent matches + KPIs (overall win rate and first/second split).

All data persists via AsyncStorage across app restarts.

Code runs with npx expo start and includes a short README.

COMMANDS

npm i

npx expo start

Optional: npm run lint (provide config)

VISUAL STYLE (simple)

Neutral light/dark support (use system preference).

Segmented controls for result and started.

Chips for common scores (2-0, 2-1…).

Clean, tournament-speed spacing; minimal dependencies.

NOTES

Focus on reliability and speed. Keep components small and typed. Where details are unspecified, choose sensible defaults that minimize taps and cognitive load.