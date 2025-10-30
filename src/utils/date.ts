import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatMatchDate(dateString: string): string {
  // Handle date-only strings (YYYY-MM-DD) by parsing in local timezone
  // to avoid UTC midnight conversion issues
  let date: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Date-only format: parse as local time
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    // Full ISO string with time: parse normally
    date = new Date(dateString);
  }

  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'MMM d, yyyy');
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
}
