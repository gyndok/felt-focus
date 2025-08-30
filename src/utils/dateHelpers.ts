import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Gets the current date and time in the user's local timezone as an ISO string
 * This ensures dates are stored relative to the user's location, not UTC
 */
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