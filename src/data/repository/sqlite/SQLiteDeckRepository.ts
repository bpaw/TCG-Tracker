import * as Crypto from 'expo-crypto';
import { Deck, GameTitle } from '../../../domain/types';
import { Repository } from '../interfaces';
import { getDatabase } from './database';
import { useAuthStore } from '../../../stores/authStore';

export interface DeckFilters {
  game?: GameTitle;
}

export class SQLiteDeckRepository implements Repository<Deck> {
  private getCurrentUserId(): string | null {
    return useAuthStore.getState().user?.id || null;
  }

  async list(filters?: DeckFilters): Promise<Deck[]> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();

    if (!userId) {
      return [];
    }

    let sql = 'SELECT * FROM decks WHERE user_id = ?';
    const params: any[] = [userId];

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
    const userId = this.getCurrentUserId();

    if (!userId) {
      return null;
    }

    const deck = await db.getFirstAsync<Deck>(
      'SELECT * FROM decks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return deck || null;
  }

  async create(data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();
    const now = new Date().toISOString();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const newDeck: Deck = {
      ...data,
      id: Crypto.randomUUID(),
      user_id: userId,
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `INSERT INTO decks (id, user_id, title, game, archetype, colors, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newDeck.id,
        newDeck.user_id,
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
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const existing = await this.get(id);
    if (!existing) return null;

    const updatedDeck: Deck = {
      ...existing,
      ...data,
      id, // ensure id cannot be changed
      user_id: existing.user_id, // ensure user_id cannot be changed
      updatedAt: new Date().toISOString(),
    };

    await db.runAsync(
      `UPDATE decks
       SET title = ?, game = ?, archetype = ?, colors = ?, notes = ?, updatedAt = ?
       WHERE id = ? AND user_id = ?`,
      [
        updatedDeck.title,
        updatedDeck.game,
        updatedDeck.archetype || null,
        updatedDeck.colors || null,
        updatedDeck.notes || null,
        updatedDeck.updatedAt,
        id,
        userId,
      ]
    );

    return updatedDeck;
  }

  async remove(id: string): Promise<boolean> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();
    if (!userId) return false;

    const existing = await this.get(id);
    if (!existing) return false;

    await db.runAsync('DELETE FROM decks WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }
}
