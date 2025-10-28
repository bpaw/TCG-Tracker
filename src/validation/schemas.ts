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
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalRounds: z.number().int().min(1, 'Must have at least 1 round').max(20, 'Max 20 rounds'),
  notes: z.string().optional(),
}).refine((data) => {
  // Validate that endDate is not before startDate
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const matchSchema = z.object({
  game: z.enum(gameTitles, {
    required_error: 'Please select a game',
  }),
  date: z.string().min(1, 'Date is required'),
  eventId: z.string().min(1, 'Event is required'),
  roundNumber: z.number().int().min(1, 'Round number is required').max(20),
  myDeckId: z.string().min(1, 'Please select your deck'),
  oppDeckArchetype: z.string().max(100).optional(),
  opponentName: z.string().max(100).optional(),
  onePieceLeader: z.string().optional(),
  onePieceColor: z.string().optional(),
  result: z.enum(matchResults, {
    required_error: 'Result is required',
  }),
  score: z.string().optional(),
  wonDieRoll: z.boolean().optional(),
  started: z.enum(startChoices).optional(),
  startTurnNumber: z.number().int().positive().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => {
  // For One Piece, require leader and color instead of oppDeckArchetype
  if (data.game === 'One Piece') {
    return data.onePieceLeader && data.onePieceColor;
  }
  // For other games, require oppDeckArchetype
  return data.oppDeckArchetype && data.oppDeckArchetype.length > 0;
}, {
  message: 'Opponent deck information is required',
  path: ['oppDeckArchetype'],
});

export type DeckFormData = z.infer<typeof deckSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type MatchFormData = z.infer<typeof matchSchema>;
