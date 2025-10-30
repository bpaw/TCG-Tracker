/**
 * Enhanced Sync Queue with Network Detection and Exponential Backoff
 *
 * Features:
 * - Network connectivity detection
 * - Exponential backoff for retries
 * - Pause/resume based on connectivity
 * - Persistent queue (survives app restart)
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';
import { formatSyncError } from './supabaseSetup';

const SYNC_QUEUE_STORAGE_KEY = '@sync_queue';

type SyncOperation = {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'events' | 'matches' | 'decks';
  data: any;
  timestamp: number;
  retries: number;
};

class SyncQueue {
  private queue: SyncOperation[] = [];
  private processing: boolean = false;
  private paused: boolean = false;
  private isOnline: boolean = true;

  // Retry configuration
  private maxRetries: number = 5;
  private initialDelay: number = 1000; // 1 second
  private maxDelay: number = 60000; // 60 seconds

  constructor() {
    this.initializeNetworkListener();
    this.loadQueue();
  }

  /**
   * Initialize network connectivity listener
   */
  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log(`[SyncQueue] Network status: ${this.isOnline ? 'Online' : 'Offline'}`);

      // If we just came back online, resume processing
      if (!wasOnline && this.isOnline && this.queue.length > 0) {
        console.log('[SyncQueue] Back online, resuming sync...');
        this.resume();
      }

      // If we went offline, pause processing
      if (wasOnline && !this.isOnline) {
        console.log('[SyncQueue] Went offline, pausing sync...');
        this.pause();
      }
    });
  }

  /**
   * Load persisted queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[SyncQueue] Loaded ${this.queue.length} operations from storage`);

        // Start processing if online
        if (this.isOnline && this.queue.length > 0) {
          this.processQueue();
        }
      }
    } catch (error) {
      console.error('[SyncQueue] Failed to load queue from storage:', error);
    }
  }

  /**
   * Persist queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncQueue] Failed to save queue to storage:', error);
    }
  }

  /**
   * Add an operation to the sync queue
   */
  enqueue(operation: Omit<SyncOperation, 'timestamp' | 'retries'>): void {
    // Check if operation already exists (prevent duplicates)
    const exists = this.queue.some(op => op.id === operation.id && op.type === operation.type);
    if (exists) {
      console.log(`[SyncQueue] Operation ${operation.id} already queued, skipping`);
      return;
    }

    this.queue.push({
      ...operation,
      timestamp: Date.now(),
      retries: 0,
    });

    // Persist queue
    this.saveQueue();

    console.log(`[SyncQueue] Enqueued ${operation.type} for ${operation.table}:${operation.id} (queue size: ${this.queue.length})`);

    // Start processing if not already running and online
    if (!this.processing && this.isOnline && !this.paused) {
      this.processQueue();
    }
  }

  /**
   * Process the queue with exponential backoff
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0 || this.paused || !this.isOnline) {
      return;
    }

    this.processing = true;
    console.log(`[SyncQueue] Starting to process ${this.queue.length} operations`);

    while (this.queue.length > 0 && !this.paused && this.isOnline) {
      const operation = this.queue[0];

      try {
        await this.executeOperation(operation);

        // Success - remove from queue
        this.queue.shift();
        await this.saveQueue();

        console.log(`[SyncQueue] Successfully synced ${operation.table}:${operation.id} (${this.queue.length} remaining)`);
      } catch (error) {
        const errorMessage = formatSyncError(error);
        console.error(`[SyncQueue] Sync failed for ${operation.table}:${operation.id}:`, errorMessage);
        operation.retries++;

        if (operation.retries >= this.maxRetries) {
          // Max retries reached - remove from queue
          console.error(`[SyncQueue] Max retries (${this.maxRetries}) reached for ${operation.id}. Dropping operation.`);
          this.queue.shift();
          await this.saveQueue();
        } else {
          // Exponential backoff
          const delay = Math.min(
            this.initialDelay * Math.pow(2, operation.retries),
            this.maxDelay
          );

          console.log(`[SyncQueue] Retrying ${operation.id} in ${delay}ms (attempt ${operation.retries + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.processing = false;
    console.log('[SyncQueue] Queue processing complete');
  }

  /**
   * Execute a single sync operation to Supabase
   */
  private async executeOperation(operation: SyncOperation): Promise<void> {
    switch (operation.table) {
      case 'events':
        await this.syncEvent(operation);
        break;
      case 'matches':
        await this.syncMatch(operation);
        break;
      case 'decks':
        await this.syncDeck(operation);
        break;
    }
  }

  /**
   * Sync event operation to Supabase
   */
  private async syncEvent(operation: SyncOperation): Promise<void> {
    const { type, id, data } = operation;

    switch (type) {
      case 'create':
      case 'update':
        const { error: upsertError } = await supabase
          .from('events')
          .upsert(this.toCloudFormat(data, 'events'), { onConflict: 'id' });

        if (upsertError) throw upsertError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        break;
    }
  }

  /**
   * Sync match operation to Supabase
   */
  private async syncMatch(operation: SyncOperation): Promise<void> {
    const { type, id, data } = operation;

    switch (type) {
      case 'create':
      case 'update':
        const { error: upsertError } = await supabase
          .from('matches')
          .upsert(this.toCloudFormat(data, 'matches'), { onConflict: 'id' });

        if (upsertError) throw upsertError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('matches')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        break;
    }
  }

  /**
   * Sync deck operation to Supabase
   */
  private async syncDeck(operation: SyncOperation): Promise<void> {
    const { type, id, data } = operation;

    switch (type) {
      case 'create':
      case 'update':
        const { error: upsertError } = await supabase
          .from('decks')
          .upsert(this.toCloudFormat(data, 'decks'), { onConflict: 'id' });

        if (upsertError) throw upsertError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('decks')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        break;
    }
  }

  /**
   * Convert local format to cloud format (snake_case for Postgres)
   */
  private toCloudFormat(data: any, table: string): any {
    switch (table) {
      case 'events':
        return {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          game: data.game,
          start_date: data.startDate,
          end_date: data.endDate,
          total_rounds: data.totalRounds,
          notes: data.notes,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
        };

      case 'matches':
        return {
          id: data.id,
          user_id: data.user_id,
          event_id: data.eventId,
          game: data.game,
          my_deck_id: data.myDeckId,
          opp_deck_archetype: data.oppDeckArchetype,
          opponent_name: data.opponentName,
          result: data.result,
          score: data.score,
          won_die_roll: data.wonDieRoll,
          started: data.started,
          on_the_play: data.onThePlay,
          round_number: data.roundNumber,
          date: data.date,
          notes: data.notes,
          one_piece_leader: data.onePieceLeader,
          one_piece_color: data.onePieceColor,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
        };

      case 'decks':
        return {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          game: data.game,
          archetype: data.archetype,
          colors: data.colors,
          notes: data.notes,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
        };

      default:
        return data;
    }
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.paused = true;
    console.log('[SyncQueue] Paused');
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.paused = false;
    console.log('[SyncQueue] Resumed');

    if (!this.processing && this.queue.length > 0 && this.isOnline) {
      this.processQueue();
    }
  }

  /**
   * Get queue status
   */
  getStatus(): {
    pending: number;
    processing: boolean;
    paused: boolean;
    online: boolean;
  } {
    return {
      pending: this.queue.length,
      processing: this.processing,
      paused: this.paused,
      online: this.isOnline,
    };
  }

  /**
   * Clear the queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    console.log('[SyncQueue] Queue cleared');
  }

  /**
   * Force sync now (manual trigger)
   */
  async forceSyncNow(): Promise<void> {
    if (this.queue.length === 0) {
      console.log('[SyncQueue] Nothing to sync');
      return;
    }

    if (!this.isOnline) {
      console.log('[SyncQueue] Cannot force sync while offline');
      return;
    }

    console.log('[SyncQueue] Force syncing now...');
    this.resume();
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();
