import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateCalendar } from '../domain/types';

const CALENDAR_KEY = '@calendar';

/**
 * Format a date as YYYY-MM-DD
 */
function formatDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Get all dates between startDate and endDate (inclusive)
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Load all calendar data
 */
async function loadCalendar(): Promise<Record<string, DateCalendar>> {
  try {
    const json = await AsyncStorage.getItem(CALENDAR_KEY);
    if (!json) return {};
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to load calendar:', error);
    return {};
  }
}

/**
 * Save calendar data
 */
async function saveCalendar(calendar: Record<string, DateCalendar>): Promise<void> {
  try {
    await AsyncStorage.setItem(CALENDAR_KEY, JSON.stringify(calendar));
  } catch (error) {
    console.error('Failed to save calendar:', error);
    throw error;
  }
}

/**
 * Add an event to the calendar for all dates in its range
 */
export async function addEventToCalendar(eventId: string, startDate: string, endDate: string): Promise<void> {
  const calendar = await loadCalendar();
  const dates = getDateRange(startDate, endDate);

  for (const dateKey of dates) {
    if (!calendar[dateKey]) {
      calendar[dateKey] = {
        date: dateKey,
        eventIds: [],
        matchIds: [],
      };
    }

    // Add event ID if not already present
    if (!calendar[dateKey].eventIds.includes(eventId)) {
      calendar[dateKey].eventIds.push(eventId);
    }
  }

  await saveCalendar(calendar);
}

/**
 * Remove an event from the calendar
 */
export async function removeEventFromCalendar(eventId: string, startDate: string, endDate: string): Promise<void> {
  const calendar = await loadCalendar();
  const dates = getDateRange(startDate, endDate);

  for (const dateKey of dates) {
    if (calendar[dateKey]) {
      calendar[dateKey].eventIds = calendar[dateKey].eventIds.filter(id => id !== eventId);

      // Clean up empty entries
      if (calendar[dateKey].eventIds.length === 0 && calendar[dateKey].matchIds.length === 0) {
        delete calendar[dateKey];
      }
    }
  }

  await saveCalendar(calendar);
}

/**
 * Add a match to the calendar
 */
export async function addMatchToCalendar(matchId: string, date: string): Promise<void> {
  const calendar = await loadCalendar();
  const dateKey = formatDateKey(date);

  if (!calendar[dateKey]) {
    calendar[dateKey] = {
      date: dateKey,
      eventIds: [],
      matchIds: [],
    };
  }

  // Add match ID if not already present
  if (!calendar[dateKey].matchIds.includes(matchId)) {
    calendar[dateKey].matchIds.push(matchId);
  }

  await saveCalendar(calendar);
}

/**
 * Remove a match from the calendar
 */
export async function removeMatchFromCalendar(matchId: string, date: string): Promise<void> {
  const calendar = await loadCalendar();
  const dateKey = formatDateKey(date);

  if (calendar[dateKey]) {
    calendar[dateKey].matchIds = calendar[dateKey].matchIds.filter(id => id !== matchId);

    // Clean up empty entries
    if (calendar[dateKey].eventIds.length === 0 && calendar[dateKey].matchIds.length === 0) {
      delete calendar[dateKey];
    }
  }

  await saveCalendar(calendar);
}

/**
 * Get calendar data for a specific date
 */
export async function getCalendarForDate(date: string): Promise<DateCalendar | null> {
  const calendar = await loadCalendar();
  const dateKey = formatDateKey(date);
  return calendar[dateKey] || null;
}

/**
 * Get all calendar data (for marking dates on calendar)
 */
export async function getAllCalendarData(): Promise<Record<string, DateCalendar>> {
  return await loadCalendar();
}

/**
 * Clear all calendar data
 */
export async function clearCalendar(): Promise<void> {
  await AsyncStorage.removeItem(CALENDAR_KEY);
}

/**
 * Rebuild the calendar from events and matches
 * This ensures the calendar data is consistent with the current events/matches
 */
export async function rebuildCalendar(
  events: Array<{ id: string; startDate: string; endDate: string }>,
  matches: Array<{ id: string; date: string }>
): Promise<void> {
  // Start with empty calendar
  const calendar: Record<string, DateCalendar> = {};

  // Add all events
  for (const event of events) {
    const dates = getDateRange(event.startDate, event.endDate);
    for (const dateKey of dates) {
      if (!calendar[dateKey]) {
        calendar[dateKey] = {
          date: dateKey,
          eventIds: [],
          matchIds: [],
        };
      }
      if (!calendar[dateKey].eventIds.includes(event.id)) {
        calendar[dateKey].eventIds.push(event.id);
      }
    }
  }

  // Add all matches
  for (const match of matches) {
    const dateKey = formatDateKey(match.date);
    if (!calendar[dateKey]) {
      calendar[dateKey] = {
        date: dateKey,
        eventIds: [],
        matchIds: [],
      };
    }
    if (!calendar[dateKey].matchIds.includes(match.id)) {
      calendar[dateKey].matchIds.push(match.id);
    }
  }

  await saveCalendar(calendar);
}
