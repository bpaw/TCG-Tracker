import { Event } from '../../../domain/types';
import { SQLiteEventRepository } from '../sqlite/SQLiteEventRepository';
import { BaseCloudRepository } from './BaseCloudRepository';

/**
 * Hybrid Cloud Event Repository
 *
 * Uses BaseCloudRepository for shared sync logic.
 * Implements a local-first architecture with cloud sync.
 */
export class CloudEventRepository extends BaseCloudRepository<Event> {
  constructor() {
    super(new SQLiteEventRepository(), 'events');
  }
}
