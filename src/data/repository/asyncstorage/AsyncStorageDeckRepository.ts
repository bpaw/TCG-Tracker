import * as Crypto from 'expo-crypto';
import { Deck, GameTitle } from '../../../domain/types';
import { Repository } from '../interfaces';
import { getItem, setItem, STORAGE_KEYS } from '../../asyncStorage';

export interface DeckFilters {
  game?: GameTitle;
}

export class AsyncStorageDeckRepository implements Repository<Deck> {
  async list(filters?: DeckFilters): Promise<Deck[]> {
    const decks = await getItem<Deck[]>(STORAGE_KEYS.DECKS);
    let result = decks || [];

    if (filters) {
      if (filters.game) {
        result = result.filter((deck) => deck.game === filters.game);
      }
    }

    // Sort by title alphabetically
    result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }

  async get(id: string): Promise<Deck | null> {
    const decks = await getItem<Deck[]>(STORAGE_KEYS.DECKS);
    return decks?.find((deck) => deck.id === id) || null;
  }

  async create(data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    const decks = await this.list();
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

  async update(id: string, data: Partial<Deck>): Promise<Deck | null> {
    const decks = await getItem<Deck[]>(STORAGE_KEYS.DECKS);
    if (!decks) return null;

    const index = decks.findIndex((deck) => deck.id === id);
    if (index === -1) {
      return null;
    }

    const oldDeck = decks[index];

    const updatedDeck: Deck = {
      ...oldDeck,
      ...data,
      id, // ensure id cannot be changed
      updatedAt: new Date().toISOString(),
    };

    decks[index] = updatedDeck;
    await setItem(STORAGE_KEYS.DECKS, decks);

    return updatedDeck;
  }

  async remove(id: string): Promise<boolean> {
    const decks = await getItem<Deck[]>(STORAGE_KEYS.DECKS);
    if (!decks) return false;

    const index = decks.findIndex((deck) => deck.id === id);
    if (index === -1) {
      return false;
    }

    decks.splice(index, 1);
    await setItem(STORAGE_KEYS.DECKS, decks);

    return true;
  }
}
