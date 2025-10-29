import * as Crypto from 'expo-crypto';
import { Deck, GameTitle } from '../../../domain/types';
import { Repository } from '../interfaces';
import { getDatabase } from './database';

export interface DeckFilters {
  game?: GameTitle;
}

export class SQLiteDeckRepository implements Repository<Deck> {
  async list(filters?: DeckFilters): Promise<Deck[]> {
    const db = await getDatabase();

    let sql = 'SELECT * FROM decks WHERE 1=1';
    const params: any[] = [];

    if (filters?.game) {
      sql += ' AND game = ?';
      params.push(filters.game);
    }

    sql += ' ORDER BY title ASC';

    const decks = await db.getAllAsync<Deck>(sql, params);
    return decks;
  }

  async get(id: string): Promise<Deck | null> {
    const db = await getDatabase();
    const deck = await db.getFirstAsync<Deck>(
      'SELECT * FROM decks WHERE id = ?',
      [id]
    );
    return deck || null;
  }

  async create(data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const newDeck: Deck = {
      ...data,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `INSERT INTO decks (id, title, game, archetype, colors, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newDeck.id,
        newDeck.title,
        newDeck.game,
        newDeck.archetype || null,
        newDeck.colors || null,
        newDeck.notes || null,
        newDeck.createdAt,
        newDeck.updatedAt,
      ]
    );

    return newDeck;
  }

  async update(id: string, data: Partial<Deck>): Promise<Deck | null> {
    const db = await getDatabase();
    const existing = await this.get(id);
    if (!existing) return null;

    const updatedDeck: Deck = {
      ...existing,
      ...data,
      id, // ensure id cannot be changed
      updatedAt: new Date().toISOString(),
    };

    await db.runAsync(
      `UPDATE decks
       SET title = ?, game = ?, archetype = ?, colors = ?, notes = ?, updatedAt = ?
       WHERE id = ?`,
      [
        updatedDeck.title,
        updatedDeck.game,
        updatedDeck.archetype || null,
        updatedDeck.colors || null,
        updatedDeck.notes || null,
        updatedDeck.updatedAt,
        id,
      ]
    );

    return updatedDeck;
  }

  async remove(id: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.get(id);
    if (!existing) return false;

    await db.runAsync('DELETE FROM decks WHERE id = ?', [id]);
    return true;
  }
}
