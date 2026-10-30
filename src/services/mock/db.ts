import type { Booking, User } from '@/types';
import {
  addDays,
  currentWibHour,
  todayWIB,
  wibDateTimeToDate,
} from '@/lib/datetime';
import { CLOSE_HOUR, OPEN_HOUR } from '@/lib/constants';

export interface StoredUser extends User {
  password: string;
}

const PREFIX = 'gor.v1';

export const STORAGE_KEYS = {
  users: `${PREFIX}.users`,
  session: `${PREFIX}.session`,
  bookings: `${PREFIX}.bookings`,
  closedSlots: `${PREFIX}.closedSlots`,
  seeded: `${PREFIX}.seeded`,
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Mode privat atau penyimpanan penuh: data demo tidak dapat disimpan.
  }
}

export function readUsers(): StoredUser[] {
  return readJSON<StoredUser[]>(STORAGE_KEYS.users, []);
}

export function writeUsers(users: StoredUser[]): void {
  writeJSON(STORAGE_KEYS.users, users);
}

export function readBookings(): Booking[] {
  return readJSON<Booking[]>(STORAGE_KEYS.bookings, []);
}

export function writeBookings(bookings: Booking[]): void {
  writeJSON(STORAGE_KEYS.bookings, bookings);
}

export function readClosedSlots(): Record<string, number[]> {
  return readJSON<Record<string, number[]>>(STORAGE_KEYS.closedSlots, {});
}

export function writeClosedSlots(slots: Record<string, number[]>): void {
  writeJSON(STORAGE_KEYS.closedSlots, slots);
}

export function readSessionUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.session);
  } catch {
    return null;
  }
}

export function writeSessionUserId(id: string | null): void {
  try {
    if (id) localStorage.setItem(STORAGE_KEYS.session, id);
    else localStorage.removeItem(STORAGE_KEYS.session);
  } catch {
    // Abaikan kegagalan penyimpanan sesi pada mode privat.
  }
}

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function getSessionUser(): User | null {
  const sessionId = readSessionUserId();
  if (!sessionId) return null;
  const found = readUsers().find((user) => user.id === sessionId);
  return found ? toPublicUser(found) : null;
}

function createSeedUsers(): StoredUser[] {
  const createdAt = new Date(Date.now() - 30 * 86_400_000).toISOString();
  return [
    {
      id: 'seed-owner',
      username: 'owner',
      email: 'owner@gor.local',
      password: 'owner123',
      role: 'owner',
      createdAt,
    },
    {
      id: 'seed-budi',
      username: 'budi',
      email: 'budi@gor.local',
      password: 'budi123',
      role: 'user',
      createdAt,
    },
  ];
}

function ensureSeedUsers(): StoredUser[] {
  const users = readUsers();
  if (users.length === 0) {
    const seeded = createSeedUsers();
    writeUsers(seeded);
    return seeded;
  }

  const missing = createSeedUsers().filter(
    (seed) => !users.some((user) => user.username === seed.username),
  );
  if (missing.length > 0) {
    const next = [...users, ...missing];
    writeUsers(next);
    return next;
  }

  return users;
}

function createSeedBookings(budi: StoredUser): Booking[] {
  const now = Date.now();
  const nowDate = new Date(now);
  const today = todayWIB(nowDate);
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  const isoAgo = (ms: number) => new Date(now - ms).toISOString();

  const bookings: Booking[] = [
    {
      id: crypto.randomUUID(),
      date: today,
      startHour: 9,
      duration: 2,
      shuttlecocks: 3,
      rackets: 2,
      note: 'Latihan rutin pagi.',
      status: 'confirmed',
      userId: budi.id,
      userName: budi.username,
      userEmail: budi.email,
      createdAt: isoAgo(2 * 86_400_000),
      updatedAt: isoAgo(86_400_000),
    },
    {
      id: crypto.randomUUID(),
      date: today,
      startHour: 16,
      duration: 1,
      shuttlecocks: 1,
      rackets: 2,
      note: 'Sparing dengan teman kantor.',
      status: 'confirmed',
      userId: budi.id,
      userName: budi.username,
      userEmail: budi.email,
      createdAt: isoAgo(3 * 86_400_000),
      updatedAt: isoAgo(2 * 86_400_000),
    },
    {
      id: crypto.randomUUID(),
      date: today,
      startHour: 14,
      duration: 1,
      shuttlecocks: 2,
      rackets: 2,
      status: 'rejected',
      userId: budi.id,
      userName: budi.username,
      userEmail: budi.email,
      createdAt: isoAgo(30 * 3_600_000),
      updatedAt: isoAgo(26 * 3_600_000),
      rejectionReason: 'Slot dipakai untuk turnamen internal.',
    },
    {
      id: crypto.randomUUID(),
      date: today,
      startHour: 12,
      duration: 1,
      shuttlecocks: 1,
      rackets: 1,
      status: 'cancelled',
      userId: budi.id,
      userName: budi.username,
      userEmail: budi.email,
      createdAt: isoAgo(50 * 3_600_000),
      updatedAt: isoAgo(45 * 3_600_000),
    },
    {
      id: crypto.randomUUID(),
      date: yesterday,
      startHour: 7,
      duration: 1,
      shuttlecocks: 1,
      rackets: 2,
      status: 'expired',
      userId: budi.id,
      userName: budi.username,
      userEmail: budi.email,
      createdAt: isoAgo(2 * 86_400_000),
      updatedAt: isoAgo(86_400_000),
      expiresAt: wibDateTimeToDate(yesterday, 7).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      date: tomorrow,
      startHour: 9,
      duration: 1,
      shuttlecocks: 2,
      rackets: 2,
      note: 'Main bareng komunitas.',
      status: 'confirmed',
      userId: budi.id,
      userName: budi.username,
      userEmail: budi.email,
      createdAt: isoAgo(5 * 3_600_000),
      updatedAt: isoAgo(4 * 3_600_000),
    },
  ];

  const occupied = new Set([9, 10, 16]);
  let pendingDate = today;
  let pendingHour: number | null = null;

  for (let hour = Math.max(OPEN_HOUR, currentWibHour(nowDate) + 1); hour < CLOSE_HOUR; hour += 1) {
    if (!occupied.has(hour) && wibDateTimeToDate(today, hour).getTime() > now) {
      pendingHour = hour;
      break;
    }
  }

  if (pendingHour === null) {
    pendingDate = tomorrow;
    pendingHour = 18;
  }

  const startAt = wibDateTimeToDate(pendingDate, pendingHour);
  const createdMs = now - 25 * 60_000;
  const expiresMs = Math.min(now + 3 * 3_600_000, startAt.getTime());

  if (expiresMs > now) {
    bookings.push({
      id: crypto.randomUUID(),
      date: pendingDate,
      startHour: pendingHour,
      duration: 1,
      shuttlecocks: 1,
      rackets: 2,
      note: 'Mau coba main sore.',
      status: 'pending',
      userId: budi.id,
      userName: budi.username,
      userEmail: budi.email,
      createdAt: new Date(createdMs).toISOString(),
      expiresAt: new Date(expiresMs).toISOString(),
    });
  }

  return bookings;
}

export function ensureSeedData(): void {
  const users = ensureSeedUsers();
  try {
    if (localStorage.getItem(STORAGE_KEYS.seeded)) return;
  } catch {
    return;
  }

  const budi = users.find((user) => user.username === 'budi');
  if (budi) writeBookings(createSeedBookings(budi));

  try {
    localStorage.setItem(STORAGE_KEYS.seeded, new Date().toISOString());
  } catch {
    // Seed tetap dipakai untuk sesi berjalan walau penanda gagal disimpan.
  }
}
