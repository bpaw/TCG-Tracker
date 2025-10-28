import * as Crypto from 'expo-crypto';
import { Match, GameTitle, MatchResult } from '../domain/types';
import { getItem, setItem, STORAGE_KEYS } from './asyncStorage';

// TODO: migrate to SQLite later for better querying and performance
// Keep these function signatures stable for easy migration

export interface MatchFilters {
  game?: GameTitle;
  deckId?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string;   // ISO date string
  result?: MatchResult;
}

export async function list(filters?: MatchFilters): Promise<Match[]> {
  const matches = await getItem<Match[]>(STORAGE_KEYS.MATCHES);
  let result = matches || [];

  if (filters) {
    if (filters.game) {
      result = result.filter((match) => match.game === filters.game);
    }
    if (filters.deckId) {
      result = result.filter((match) => match.myDeckId === filters.deckId);
    }
    if (filters.result) {
      result = result.filter((match) => match.result === filters.result);
    }
    if (filters.dateFrom) {
      result = result.filter((match) => match.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((match) => match.date <= filters.dateTo!);
    }
  }

  // Sort by date descending (newest first)
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return result;
}

export async function get(id: string): Promise<Match | null> {
  const matches = await getItem<Match[]>(STORAGE_KEYS.MATCHES);
  return matches?.find((match) => match.id === id) || null;
}

export async function create(
  data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Match> {
  const matches = await list();
  const now = new Date().toISOString();

  const newMatch: Match = {
    ...data,
    id: Crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  matches.push(newMatch);
  await setItem(STORAGE_KEYS.MATCHES, matches);

  return newMatch;
}

export async function update(id: string, data: Partial<Match>): Promise<Match | null> {
  const matches = await getItem<Match[]>(STORAGE_KEYS.MATCHES);
  if (!matches) return null;

  const index = matches.findIndex((match) => match.id === id);
  if (index === -1) {
    return null;
  }

  const updatedMatch: Match = {
    ...matches[index],
    ...data,
    id, // ensure id cannot be changed
    updatedAt: new Date().toISOString(),
  };

  matches[index] = updatedMatch;
  await setItem(STORAGE_KEYS.MATCHES, matches);

  return updatedMatch;
}

export async function remove(id: string): Promise<boolean> {
  const matches = await getItem<Match[]>(STORAGE_KEYS.MATCHES);
  if (!matches) return false;

  const index = matches.findIndex((match) => match.id === id);
  if (index === -1) {
    return false;
  }

  matches.splice(index, 1);
  await setItem(STORAGE_KEYS.MATCHES, matches);

  return true;
}
