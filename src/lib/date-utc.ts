/**
 * Calendar-date helpers that treat every date as a UTC wall-clock date.
 *
 * The app only cares about calendar days ("2026-06-30"), not moments in time.
 * Using the system timezone for date parsing and formatting caused an off-by-one
 * day when storing dates in Postgres, because `parseISO("2026-06-30")` returns
 * local midnight which is the previous day in UTC. These helpers always work in
 * UTC so the string that goes into the DB matches the string the engine sees.
 */

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonth(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function endOfMonth(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
}

export function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setUTCDate(d.getUTCDate() + days);
  return result;
}

export function subDays(d: Date, days: number): Date {
  return addDays(d, -days);
}

export function subMonths(d: Date, months: number): Date {
  const result = new Date(d);
  result.setUTCMonth(d.getUTCMonth() - months);
  return result;
}

export function startOfDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export function isFirstDayOfMonth(dateStr: string): boolean {
  return dateStr.endsWith("-01");
}
