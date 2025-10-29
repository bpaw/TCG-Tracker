import * as Crypto from 'expo-crypto';
import { Match, GameTitle, MatchResult } from '../../../domain/types';
import { Repository } from '../interfaces';
import { getDatabase } from './database';

export interface MatchFilters {
  game?: GameTitle;
  deckId?: string;
  dateFrom?: string;
  dateTo?: string;
  result?: MatchResult;
}

export class SQLiteMatchRepository implements Repository<Match> {
  async list(filters?: MatchFilters): Promise<Match[]> {
    const db = await getDatabase();

    let sql = 'SELECT * FROM matches WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.game) {
        sql += ' AND game = ?';
        params.push(filters.game);
      }
      if (filters.deckId) {
        sql += ' AND myDeckId = ?';
        params.push(filters.deckId);
      }
      if (filters.result) {
        sql += ' AND result = ?';
        params.push(filters.result);
      }
      if (filters.dateFrom) {
        sql += ' AND date >= ?';
        params.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        sql += ' AND date <= ?';
        params.push(filters.dateTo);
      }
    }

    sql += ' ORDER BY date DESC';

    const matches = await db.getAllAsync<any>(sql, params);

    // Convert boolean fields from SQLite integers
    return matches.map(match => ({
      ...match,
      wonDieRoll: match.wonDieRoll !== null ? Boolean(match.wonDieRoll) : undefined,
      onThePlay: match.onThePlay !== null ? Boolean(match.onThePlay) : undefined,
    }));
  }

  async get(id: string): Promise<Match | null> {
    const db = await getDatabase();
    const match = await db.getFirstAsync<any>(
      'SELECT * FROM matches WHERE id = ?',
      [id]
    );

    if (!match) return null;

    // Convert boolean fields from SQLite integers
    return {
      ...match,
      wonDieRoll: match.wonDieRoll !== null ? Boolean(match.wonDieRoll) : undefined,
      onThePlay: match.onThePlay !== null ? Boolean(match.onThePlay) : undefined,
    };
  }

  async create(data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const newMatch: Match = {
      ...data,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `INSERT INTO matches (
        id, eventId, game, myDeckId, oppDeckArchetype, opponentName, result, score,
        wonDieRoll, started, onThePlay, roundNumber, date, notes, onePieceLeader,
        onePieceColor, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newMatch.id,
        newMatch.eventId || null,
        newMatch.game,
        newMatch.myDeckId || null,
        newMatch.oppDeckArchetype,
        newMatch.opponentName || null,
        newMatch.result,
        newMatch.score || null,
        newMatch.wonDieRoll !== undefined ? (newMatch.wonDieRoll ? 1 : 0) : null,
        newMatch.started || null,
        newMatch.onThePlay !== undefined ? (newMatch.onThePlay ? 1 : 0) : null,
        newMatch.roundNumber,
        newMatch.date,
        newMatch.notes || null,
        newMatch.onePieceLeader || null,
        newMatch.onePieceColor || null,
        newMatch.createdAt,
        newMatch.updatedAt,
      ]
    );

    // Add to calendar index
    await this.addToCalendarIndex(newMatch.id, newMatch.date);

    return newMatch;
  }

  async update(id: string, data: Partial<Match>): Promise<Match | null> {
    const db = await getDatabase();
    const existing = await this.get(id);
    if (!existing) return null;

    const updatedMatch: Match = {
      ...existing,
      ...data,
      id, // ensure id cannot be changed
      updatedAt: new Date().toISOString(),
    };

    await db.runAsync(
      `UPDATE matches
       SET eventId = ?, game = ?, myDeckId = ?, oppDeckArchetype = ?, opponentName = ?,
           result = ?, score = ?, wonDieRoll = ?, started = ?, onThePlay = ?,
           roundNumber = ?, date = ?, notes = ?, onePieceLeader = ?, onePieceColor = ?,
           updatedAt = ?
       WHERE id = ?`,
      [
        updatedMatch.eventId || null,
        updatedMatch.game,
        updatedMatch.myDeckId || null,
        updatedMatch.oppDeckArchetype,
        updatedMatch.opponentName || null,
        updatedMatch.result,
        updatedMatch.score || null,
        updatedMatch.wonDieRoll !== undefined ? (updatedMatch.wonDieRoll ? 1 : 0) : null,
        updatedMatch.started || null,
        updatedMatch.onThePlay !== undefined ? (updatedMatch.onThePlay ? 1 : 0) : null,
        updatedMatch.roundNumber,
        updatedMatch.date,
        updatedMatch.notes || null,
        updatedMatch.onePieceLeader || null,
        updatedMatch.onePieceColor || null,
        updatedMatch.updatedAt,
        id,
      ]
    );

    // Update calendar index if date changed
    if (existing.date !== updatedMatch.date) {
      await this.removeFromCalendarIndex(id, existing.date);
      await this.addToCalendarIndex(id, updatedMatch.date);
    }

    return updatedMatch;
  }

  async remove(id: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.get(id);
    if (!existing) return false;

    await db.runAsync('DELETE FROM matches WHERE id = ?', [id]);

    // Remove from calendar index
    await this.removeFromCalendarIndex(id, existing.date);

    return true;
  }

  /**
   * Add match to calendar index
   */
  private async addToCalendarIndex(matchId: string, date: string): Promise<void> {
    const db = await getDatabase();
    const dateKey = date.split('T')[0];

    await db.runAsync(
      'INSERT OR IGNORE INTO calendar (date, eventId, matchId) VALUES (?, ?, ?)',
      [dateKey, '', matchId]
    );
  }

  /**
   * Remove match from calendar index
   */
  private async removeFromCalendarIndex(matchId: string, date: string): Promise<void> {
    const db = await getDatabase();
    const dateKey = date.split('T')[0];

    await db.runAsync(
      'DELETE FROM calendar WHERE date = ? AND eventId = ? AND matchId = ?',
      [dateKey, '', matchId]
    );
  }
}
