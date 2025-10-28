import { z } from 'zod';

export const gameTitles = [
  'Magic: The Gathering',
  'Pokémon',
  'Yu-Gi-Oh!',
  'Flesh and Blood',
  'Lorcana',
  'One Piece',
  'Other',
] as const;

export const matchResults = ['WIN', 'LOSS', 'TIE'] as const;
export const startChoices = ['FIRST', 'SECOND', 'UNKNOWN'] as const;
export const scoreOptions = ['2-0', '2-1', '1-2', '0-2', '1-1-1'] as const;

export const deckSchema = z.object({
  title: z.string().min(1, 'Deck title is required').max(100),
  game: z.enum(gameTitles, {
    required_error: 'Please select a game',
  }),
  notes: z.string().optional(),
  archived: z.boolean().optional(),
});

export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  game: z.enum(gameTitles, {
    required_error: 'Please select a game',
  }),
  date: z.string().min(1, 'Date is required'),
  totalRounds: z.number().int().min(1, 'Must have at least 1 round').max(20, 'Max 20 rounds'),
  notes: z.string().optional(),
});

export const matchSchema = z.object({
  game: z.enum(gameTitles, {
    required_error: 'Please select a game',
  }),
  date: z.string().min(1, 'Date is required'),
  eventId: z.string().min(1, 'Event is required'),
  roundNumber: z.number().int().min(1, 'Round number is required').max(20),
  myDeckId: z.string().min(1, 'Please select your deck'),
  oppDeckArchetype: z.string().min(1, 'Opponent deck archetype is required').max(100),
  opponentName: z.string().max(100).optional(),
  result: z.enum(matchResults, {
    required_error: 'Result is required',
  }),
  score: z.string().optional(),
  wonDieRoll: z.boolean().optional(),
  started: z.enum(startChoices).optional(),
  startTurnNumber: z.number().int().positive().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type DeckFormData = z.infer<typeof deckSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type MatchFormData = z.infer<typeof matchSchema>;
