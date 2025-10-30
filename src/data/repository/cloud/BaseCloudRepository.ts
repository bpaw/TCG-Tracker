/**
 * Base Cloud Repository
 *
 * Provides shared sync logic for all cloud repositories via composition.
 * Eliminates code duplication across Event/Match/Deck repositories.
 */

import { Repository } from '../interfaces';
import { syncQueue } from './syncQueue';

export type TableName = 'events' | 'matches' | 'decks';

/**
 * Base class for cloud repositories with automatic sync
 */
export class BaseCloudRepository<T extends { id: string }> implements Repository<T> {
  constructor(
    private localRepo: Repository<T>,
    private tableName: TableName
  ) {}

  /**
   * List - read from local
   */
  async list(filters?: any): Promise<T[]> {
    return this.localRepo.list(filters);
  }

  /**
   * Get - read from local
   */
  async get(id: string): Promise<T | null> {
    return this.localRepo.get(id);
  }

  /**
   * Create - write local + queue sync
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    // 1. Write to local first (fast)
    const entity = await this.localRepo.create(data);

    // 2. Queue background sync (non-blocking)
    this.queueSync(entity, 'create');

    return entity;
  }

  /**
   * Update - write local + queue sync
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    // 1. Update local first (fast)
    const entity = await this.localRepo.update(id, data);

    if (entity) {
      // 2. Queue background sync (non-blocking)
      this.queueSync(entity, 'update');
    }

    return entity;
  }

  /**
   * Remove - delete local + queue sync
   */
  async remove(id: string): Promise<boolean> {
    // Get entity before deleting (need for sync)
    const entity = await this.localRepo.get(id);

    // 1. Delete from local first (fast)
    const success = await this.localRepo.remove(id);

    if (success && entity) {
      // 2. Queue background sync (non-blocking)
      this.queueSync(entity, 'delete');
    }

    return success;
  }

  /**
   * Queue an operation for background sync
   */
  private queueSync(entity: T, type: 'create' | 'update' | 'delete'): void {
    syncQueue.enqueue({
      id: entity.id,
      type,
      table: this.tableName,
      data: entity,
    });
  }
}
