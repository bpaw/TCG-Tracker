/**
 * Deck Repository - Unified interface for deck storage
 *
 * This module provides a consistent API for deck operations regardless of the
 * underlying storage implementation (AsyncStorage, SQLite, or Cloud).
 */

import { Deck } from '../domain/types';
import repositoryFactory, { DeckFilters } from './repository/factory';

// Re-export DeckFilters for backwards compatibility
export type { DeckFilters };

/**
 * Get the active deck repository implementation
 */
function getRepo() {
  return repositoryFactory.getDeckRepository();
}

/**
 * List all decks with optional filters
 */
export async function list(filters?: DeckFilters): Promise<Deck[]> {
  return getRepo().list(filters);
}

/**
 * Get a single deck by ID
 */
export async function get(id: string): Promise<Deck | null> {
  return getRepo().get(id);
}

/**
 * Create a new deck
 */
export async function create(
  data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Deck> {
  return getRepo().create(data);
}

/**
 * Update an existing deck
 */
export async function update(id: string, data: Partial<Deck>): Promise<Deck | null> {
  return getRepo().update(id, data);
}

/**
 * Archive/unarchive a deck
 */
export async function archive(id: string, archived = true): Promise<Deck | null> {
  return update(id, { archived });
}

/**
 * Remove a deck
 */
export async function remove(id: string): Promise<boolean> {
  return getRepo().remove(id);
}
