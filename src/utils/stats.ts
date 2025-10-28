import { Match, Deck } from '../domain/types';

export interface OverallRecord {
  wins: number;
  losses: number;
  ties: number;
  total: number;
  formatted: string; // "8-4-1"
}

export interface WinRateData {
  wins: number;
  total: number;
  percentage: number;
}

export interface DeckWinRate {
  deckId: string;
  deckTitle: string;
  wins: number;
  losses: number;
  ties: number;
  total: number;
  winRate: number;
}

export interface FirstVsSecondSplit {
  first: WinRateData;
  second: WinRateData;
}

export function getOverallRecord(matches: Match[]): OverallRecord {
  const wins = matches.filter((m) => m.result === 'WIN').length;
  const losses = matches.filter((m) => m.result === 'LOSS').length;
  const ties = matches.filter((m) => m.result === 'TIE').length;
  const total = matches.length;

  return {
    wins,
    losses,
    ties,
    total,
    formatted: `${wins}-${losses}-${ties}`,
  };
}

export function getWinRate(matches: Match[]): WinRateData {
  const wins = matches.filter((m) => m.result === 'WIN').length;
  const total = matches.length;
  const percentage = total > 0 ? (wins / total) * 100 : 0;

  return {
    wins,
    total,
    percentage,
  };
}

export function getWinRateByDeck(matches: Match[], decks: Deck[]): DeckWinRate[] {
  const deckMap = new Map(decks.map((d) => [d.id, d]));
  const deckStats = new Map<string, DeckWinRate>();

  matches.forEach((match) => {
    const deck = deckMap.get(match.myDeckId);
    if (!deck) return;

    if (!deckStats.has(deck.id)) {
      deckStats.set(deck.id, {
        deckId: deck.id,
        deckTitle: deck.title,
        wins: 0,
        losses: 0,
        ties: 0,
        total: 0,
        winRate: 0,
      });
    }

    const stats = deckStats.get(deck.id)!;
    stats.total += 1;

    if (match.result === 'WIN') stats.wins += 1;
    else if (match.result === 'LOSS') stats.losses += 1;
    else if (match.result === 'TIE') stats.ties += 1;
  });

  // Calculate win rates
  const results = Array.from(deckStats.values());
  results.forEach((stats) => {
    stats.winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
  });

  // Sort by total games descending
  results.sort((a, b) => b.total - a.total);

  return results;
}

export function getFirstVsSecondSplit(matches: Match[]): FirstVsSecondSplit {
  const firstMatches = matches.filter((m) => m.started === 'FIRST');
  const secondMatches = matches.filter((m) => m.started === 'SECOND');

  return {
    first: getWinRate(firstMatches),
    second: getWinRate(secondMatches),
  };
}
