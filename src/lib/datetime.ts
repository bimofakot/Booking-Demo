const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

const pad = (value: number): string => String(value).padStart(2, '0');

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

function shiftToWib(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET_MS);
}

export function todayWIB(now: Date = new Date()): string {
  const wib = shiftToWib(now);
  return `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())}`;
}

export function currentWibHour(now: Date = new Date()): number {
  return shiftToWib(now).getUTCHours();
}

export function parseDateString(value: string): DateParts | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function isValidDateString(value: string): boolean {
  return parseDateString(value) !== null;
}

function dateStringFromUtcDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function addDays(date: string, days: number): string {
  const parts = parseDateString(date);
  if (!parts) return date;
  return dateStringFromUtcDate(
    new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days)),
  );
}

export function daysBetween(from: string, to: string): number {
  const start = parseDateString(from);
  const end = parseDateString(to);
  if (!start || !end) return Number.NaN;
  return Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      DAY_MS,
  );
}

export function wibDateTimeToDate(date: string, hour: number, minute = 0): Date {
  const parts = parseDateString(date);
  if (!parts) return new Date(Number.NaN);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute) - WIB_OFFSET_MS);
}

export function isSlotInPast(date: string, hour: number, now: Date = new Date()): boolean {
  return wibDateTimeToDate(date, hour).getTime() <= now.getTime();
}

function dateToUtcNoon(date: string): Date {
  const parts = parseDateString(date);
  if (!parts) return new Date(Number.NaN);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));
}

export function formatDateLong(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateToUtcNoon(date));
}

export function formatDateMedium(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateToUtcNoon(date));
}

export function formatDateCompact(date: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(dateToUtcNoon(date));
}

export function relativeDayLabel(date: string, today: string = todayWIB()): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Besok';
  if (diff === -1) return 'Kemarin';
  return formatDateCompact(date);
}

export function formatHour(hour: number): string {
  return `${pad(hour)}:00`;
}

export function formatTimeRange(startHour: number, duration: number): string {
  return `${formatHour(startHour)}–${formatHour(startHour + duration)}`;
}

export function formatDateTimeWib(isoDate?: string): string {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '-';

  const wib = shiftToWib(date);
  const dateLabel = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate(), 12)));

  return `${dateLabel}, ${pad(wib.getUTCHours())}.${pad(wib.getUTCMinutes())} WIB`;
}

export function formatRemaining(targetIso: string | undefined, nowMs: number = Date.now()): string | null {
  if (!targetIso) return null;
  const target = Date.parse(targetIso);
  if (!Number.isFinite(target)) return null;

  const diff = target - nowMs;
  if (diff <= 0) return null;

  const minutes = Math.max(1, Math.ceil(diff / 60_000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours > 0 && rest > 0) return `${hours} jam ${rest} menit`;
  if (hours > 0) return `${hours} jam`;
  return `${rest} menit`;
}
