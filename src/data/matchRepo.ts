/**
 * Match Repository - Unified interface for match storage
 *
 * This module provides a consistent API for match operations regardless of the
 * underlying storage implementation (AsyncStorage, SQLite, or Cloud).
 */

import { Match } from '../domain/types';
import repositoryFactory, { MatchFilters } from './repository/factory';

// Re-export MatchFilters for backwards compatibility
export type { MatchFilters };

/**
 * Get the active match repository implementation
 */
function getRepo() {
  return repositoryFactory.getMatchRepository();
}

/**
 * List all matches with optional filters
 */
export async function list(filters?: MatchFilters): Promise<Match[]> {
  return getRepo().list(filters);
}

/**
 * Get a single match by ID
 */
export async function get(id: string): Promise<Match | null> {
  return getRepo().get(id);
}

/**
 * Create a new match
 */
export async function create(
  data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Match> {
  return getRepo().create(data);
}

/**
 * Update an existing match
 */
export async function update(id: string, data: Partial<Match>): Promise<Match | null> {
  return getRepo().update(id, data);
}

/**
 * Remove a match
 */
export async function remove(id: string): Promise<boolean> {
  return getRepo().remove(id);
}
