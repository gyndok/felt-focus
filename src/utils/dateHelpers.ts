import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

/**
 * Formats a date string (YYYY-MM-DD) for display without timezone conversion
 * This prevents dates from shifting when displayed in different timezones
 */
export function formatDateForDisplay(dateString: string): string {
  // Parse the date components directly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString();
}

/**
 * Formats a date string for chart display (short format)
 */
export function formatDateForChart(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getCurrentLocalDateTime(): string {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const zonedTime = toZonedTime(now, userTimeZone);
  return fromZonedTime(zonedTime, userTimeZone).toISOString();
}

/**
 * Gets the current date in the user's local timezone as a date string (YYYY-MM-DD)
 * This ensures the date represents the actual day for the user, not UTC day
 */
export function getCurrentLocalDate(): string {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const zonedTime = toZonedTime(now, userTimeZone);
  
  // Format as YYYY-MM-DD in local timezone
  const year = zonedTime.getFullYear();
  const month = String(zonedTime.getMonth() + 1).padStart(2, '0');
  const day = String(zonedTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Converts a timestamp to local date string (YYYY-MM-DD)
 * This ensures the date represents the actual day for the user, not UTC day
 */
export function timestampToLocalDate(timestamp: string | Date): string {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date(timestamp);
  const zonedTime = toZonedTime(date, userTimeZone);
  
  return format(zonedTime, 'yyyy-MM-dd');
}