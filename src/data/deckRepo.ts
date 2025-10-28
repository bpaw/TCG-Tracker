import * as Crypto from 'expo-crypto';
import { Deck } from '../domain/types';
import { getItem, setItem, STORAGE_KEYS } from './asyncStorage';

// TODO: migrate to SQLite later for better querying and performance
// Keep these function signatures stable for easy migration

export async function list(): Promise<Deck[]> {
  const decks = await getItem<Deck[]>(STORAGE_KEYS.DECKS);
  return decks || [];
}

export async function get(id: string): Promise<Deck | null> {
  const decks = await list();
  return decks.find((deck) => deck.id === id) || null;
}

export async function create(
  data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Deck> {
  const decks = await list();
  const now = new Date().toISOString();

  const newDeck: Deck = {
    ...data,
    id: Crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  decks.push(newDeck);
  await setItem(STORAGE_KEYS.DECKS, decks);

  return newDeck;
}

export async function update(id: string, data: Partial<Deck>): Promise<Deck | null> {
  const decks = await list();
  const index = decks.findIndex((deck) => deck.id === id);

  if (index === -1) {
    return null;
  }

  const updatedDeck: Deck = {
    ...decks[index],
    ...data,
    id, // ensure id cannot be changed
    updatedAt: new Date().toISOString(),
  };

  decks[index] = updatedDeck;
  await setItem(STORAGE_KEYS.DECKS, decks);

  return updatedDeck;
}

export async function archive(id: string, archived = true): Promise<Deck | null> {
  return update(id, { archived });
}
