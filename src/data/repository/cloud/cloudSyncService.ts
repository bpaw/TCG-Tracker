/**
 * Cloud Sync Service
 *
 * Handles manual sync operations for uploading all local data to cloud
 */

import { SQLiteEventRepository } from '../sqlite/SQLiteEventRepository';
import { SQLiteMatchRepository } from '../sqlite/SQLiteMatchRepository';
import { SQLiteDeckRepository } from '../sqlite/SQLiteDeckRepository';
import { syncQueue } from './syncQueue';

export interface SyncProgress {
  total: number;
  completed: number;
  currentItem: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

class CloudSyncService {
  private isSyncing: boolean = false;

  /**
   * Check if sync is currently in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Manually sync all local data to cloud
   * This uploads all SQLite data to Supabase
   */
  async syncAllDataToCloud(
    onProgress?: SyncProgressCallback
  ): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    this.isSyncing = true;

    try {
      // Initialize local repositories
      const eventRepo = new SQLiteEventRepository();
      const matchRepo = new SQLiteMatchRepository();
      const deckRepo = new SQLiteDeckRepository();

      // Fetch all local data
      console.log('[CloudSyncService] Fetching all local data...');
      const [events, matches, decks] = await Promise.all([
        eventRepo.list(),
        matchRepo.list(),
        deckRepo.list(),
      ]);

      const totalItems = events.length + matches.length + decks.length;
      let completed = 0;

      console.log(`[CloudSyncService] Found ${totalItems} items to sync`);

      if (totalItems === 0) {
        this.isSyncing = false;
        return { success: true };
      }

      // IMPORTANT: Sync order matters due to foreign key constraints!
      // 1. Events (no dependencies)
      // 2. Decks (no dependencies)
      // 3. Matches (depends on events + decks via foreign keys)

      // Queue all events FIRST
      console.log(`[CloudSyncService] Queueing ${events.length} events...`);
      for (const event of events) {
        syncQueue.enqueue({
          id: event.id,
          type: 'create', // Use create to ensure upsert
          table: 'events',
          data: event,
        });
        completed++;
        onProgress?.({
          total: totalItems,
          completed,
          currentItem: `Event: ${event.name}`,
        });
      }

      // Queue all decks SECOND
      console.log(`[CloudSyncService] Queueing ${decks.length} decks...`);
      for (const deck of decks) {
        syncQueue.enqueue({
          id: deck.id,
          type: 'create',
          table: 'decks',
          data: deck,
        });
        completed++;
        onProgress?.({
          total: totalItems,
          completed,
          currentItem: `Deck: ${deck.title}`,
        });
      }

      // Queue all matches LAST (they reference events and decks)
      console.log(`[CloudSyncService] Queueing ${matches.length} matches...`);
      for (const match of matches) {
        syncQueue.enqueue({
          id: match.id,
          type: 'create',
          table: 'matches',
          data: match,
        });
        completed++;
        onProgress?.({
          total: totalItems,
          completed,
          currentItem: `Match #${match.roundNumber}`,
        });
      }

      console.log(`[CloudSyncService] Queued ${totalItems} items for sync`);

      // Force sync to start immediately
      await syncQueue.forceSyncNow();

      this.isSyncing = false;
      return { success: true };
    } catch (error) {
      console.error('[CloudSyncService] Sync failed:', error);
      this.isSyncing = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current sync queue status
   */
  getSyncStatus() {
    return syncQueue.getStatus();
  }

  /**
   * Clear the sync queue
   */
  async clearQueue() {
    await syncQueue.clear();
  }
}

// Singleton instance
export const cloudSyncService = new CloudSyncService();
