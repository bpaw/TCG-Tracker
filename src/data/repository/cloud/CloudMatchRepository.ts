import { Match } from '../../../domain/types';
import { SQLiteMatchRepository } from '../sqlite/SQLiteMatchRepository';
import { BaseCloudRepository } from './BaseCloudRepository';

/**
 * Hybrid Cloud Match Repository
 *
 * Uses BaseCloudRepository for shared sync logic.
 * Implements a local-first architecture with cloud sync.
 */
export class CloudMatchRepository extends BaseCloudRepository<Match> {
  constructor() {
    super(new SQLiteMatchRepository(), 'matches');
  }
}
