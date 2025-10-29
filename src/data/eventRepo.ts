/**
 * Event Repository - Unified interface for event storage
 *
 * This module provides a consistent API for event operations regardless of the
 * underlying storage implementation (AsyncStorage, SQLite, or Cloud).
 */

import { Event } from '../domain/types';
import repositoryFactory from './repository/factory';

/**
 * Get the active event repository implementation
 */
function getRepo() {
  return repositoryFactory.getEventRepository();
}

/**
 * List all events
 */
export async function list(): Promise<Event[]> {
  return getRepo().list();
}

/**
 * Get a single event by ID
 */
export async function get(id: string): Promise<Event | null> {
  return getRepo().get(id);
}

/**
 * Create a new event
 */
export async function create(
  data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Event> {
  return getRepo().create(data);
}

/**
 * Update an existing event
 */
export async function update(id: string, data: Partial<Event>): Promise<Event | null> {
  return getRepo().update(id, data);
}

/**
 * Remove an event
 */
export async function remove(id: string): Promise<boolean> {
  return getRepo().remove(id);
}
