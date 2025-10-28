import * as Crypto from 'expo-crypto';
import { Event, GameTitle } from '../domain/types';
import { getItem, setItem, STORAGE_KEYS } from './asyncStorage';
import * as CalendarRepo from './calendarRepo';

// TODO: migrate to SQLite later for better querying and performance
// Keep these function signatures stable for easy migration

export async function list(): Promise<Event[]> {
  const events = await getItem<Event[]>(STORAGE_KEYS.EVENTS);
  const result = events || [];

  // Sort by startDate descending (newest first)
  result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return result;
}

export async function get(id: string): Promise<Event | null> {
  const events = await list();
  return events.find((event) => event.id === id) || null;
}

export async function create(
  data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Event> {
  const events = await list();
  const now = new Date().toISOString();

  const newEvent: Event = {
    ...data,
    id: Crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  events.push(newEvent);
  await setItem(STORAGE_KEYS.EVENTS, events);

  // Dual write to calendar
  await CalendarRepo.addEventToCalendar(newEvent.id, newEvent.startDate, newEvent.endDate);

  return newEvent;
}

export async function update(id: string, data: Partial<Event>): Promise<Event | null> {
  const events = await getItem<Event[]>(STORAGE_KEYS.EVENTS);
  if (!events) return null;

  const index = events.findIndex((event) => event.id === id);
  if (index === -1) {
    return null;
  }

  const oldEvent = events[index];

  const updatedEvent: Event = {
    ...oldEvent,
    ...data,
    id, // ensure id cannot be changed
    updatedAt: new Date().toISOString(),
  };

  events[index] = updatedEvent;
  await setItem(STORAGE_KEYS.EVENTS, events);

  // Update calendar if dates changed
  if (oldEvent.startDate !== updatedEvent.startDate || oldEvent.endDate !== updatedEvent.endDate) {
    await CalendarRepo.removeEventFromCalendar(id, oldEvent.startDate, oldEvent.endDate);
    await CalendarRepo.addEventToCalendar(id, updatedEvent.startDate, updatedEvent.endDate);
  }

  return updatedEvent;
}

export async function remove(id: string): Promise<boolean> {
  const events = await getItem<Event[]>(STORAGE_KEYS.EVENTS);
  if (!events) return false;

  const index = events.findIndex((event) => event.id === id);
  if (index === -1) {
    return false;
  }

  const eventToRemove = events[index];

  events.splice(index, 1);
  await setItem(STORAGE_KEYS.EVENTS, events);

  // Remove from calendar
  await CalendarRepo.removeEventFromCalendar(id, eventToRemove.startDate, eventToRemove.endDate);

  return true;
}
