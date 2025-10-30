import * as Crypto from 'expo-crypto';
import { Event } from '../../../domain/types';
import { Repository } from '../interfaces';
import { getDatabase } from './database';
import { useAuthStore } from '../../../stores/authStore';
import { useSubscriptionStore } from '../../../stores/subscriptionStore';

export class SQLiteEventRepository implements Repository<Event> {
  private getCurrentUserId(): string | null {
    return useAuthStore.getState().user?.id || null;
  }

  async list(): Promise<Event[]> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();

    if (!userId) {
      return [];
    }

    const events = await db.getAllAsync<Event>(
      'SELECT * FROM events WHERE user_id = ? ORDER BY startDate DESC',
      [userId]
    );
    return events;
  }

  async get(id: string): Promise<Event | null> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();

    if (!userId) {
      return null;
    }

    const event = await db.getFirstAsync<Event>(
      'SELECT * FROM events WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return event || null;
  }

  async create(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();
    const now = new Date().toISOString();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Check subscription limits for free tier
    const { canCreateEvent } = useSubscriptionStore.getState();
    const currentEvents = await this.list();
    if (!canCreateEvent(currentEvents.length)) {
      throw new Error('Event limit reached. Upgrade to Premium for unlimited events.');
    }

    const newEvent: Event = {
      ...data,
      id: Crypto.randomUUID(),
      user_id: userId,
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `INSERT INTO events (id, user_id, name, game, startDate, endDate, totalRounds, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEvent.id,
        newEvent.user_id,
        newEvent.name,
        newEvent.game,
        newEvent.startDate,
        newEvent.endDate,
        newEvent.totalRounds,
        newEvent.notes || null,
        newEvent.createdAt,
        newEvent.updatedAt,
      ]
    );

    // Add to calendar index
    await this.addToCalendarIndex(newEvent.id, newEvent.startDate, newEvent.endDate);

    return newEvent;
  }

  async update(id: string, data: Partial<Event>): Promise<Event | null> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const existing = await this.get(id);
    if (!existing) return null;

    const updatedEvent: Event = {
      ...existing,
      ...data,
      id, // ensure id cannot be changed
      user_id: existing.user_id, // ensure user_id cannot be changed
      updatedAt: new Date().toISOString(),
    };

    await db.runAsync(
      `UPDATE events
       SET name = ?, game = ?, startDate = ?, endDate = ?, totalRounds = ?, notes = ?, updatedAt = ?
       WHERE id = ? AND user_id = ?`,
      [
        updatedEvent.name,
        updatedEvent.game,
        updatedEvent.startDate,
        updatedEvent.endDate,
        updatedEvent.totalRounds,
        updatedEvent.notes || null,
        updatedEvent.updatedAt,
        id,
        userId,
      ]
    );

    // Update calendar index if dates changed
    if (existing.startDate !== updatedEvent.startDate || existing.endDate !== updatedEvent.endDate) {
      await this.removeFromCalendarIndex(id, existing.startDate, existing.endDate);
      await this.addToCalendarIndex(id, updatedEvent.startDate, updatedEvent.endDate);
    }

    return updatedEvent;
  }

  async remove(id: string): Promise<boolean> {
    const db = await getDatabase();
    const userId = this.getCurrentUserId();
    if (!userId) return false;

    const existing = await this.get(id);
    if (!existing) return false;

    await db.runAsync('DELETE FROM events WHERE id = ? AND user_id = ?', [id, userId]);

    // Remove from calendar index
    await this.removeFromCalendarIndex(id, existing.startDate, existing.endDate);

    return true;
  }

  /**
   * Add event to calendar index for all dates in its range
   */
  private async addToCalendarIndex(eventId: string, startDate: string, endDate: string): Promise<void> {
    const db = await getDatabase();
    const dates = this.getDateRange(startDate, endDate);

    for (const date of dates) {
      await db.runAsync(
        'INSERT OR IGNORE INTO calendar (date, eventId, matchId) VALUES (?, ?, ?)',
        [date, eventId, '']
      );
    }
  }

  /**
   * Remove event from calendar index
   */
  private async removeFromCalendarIndex(eventId: string, startDate: string, endDate: string): Promise<void> {
    const db = await getDatabase();
    const dates = this.getDateRange(startDate, endDate);

    for (const date of dates) {
      await db.runAsync(
        'DELETE FROM calendar WHERE date = ? AND eventId = ? AND matchId = ?',
        [date, eventId, '']
      );
    }
  }

  /**
   * Get all dates between startDate and endDate (inclusive)
   */
  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}
