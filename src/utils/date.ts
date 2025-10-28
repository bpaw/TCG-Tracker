import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);

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
