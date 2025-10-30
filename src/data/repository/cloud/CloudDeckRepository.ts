import { Deck } from '../../../domain/types';
import { SQLiteDeckRepository } from '../sqlite/SQLiteDeckRepository';
import { BaseCloudRepository } from './BaseCloudRepository';

/**
 * Hybrid Cloud Deck Repository
 *
 * Uses BaseCloudRepository for shared sync logic.
 * Implements a local-first architecture with cloud sync.
 */
export class CloudDeckRepository extends BaseCloudRepository<Deck> {
  constructor() {
    super(new SQLiteDeckRepository(), 'decks');
  }
}
