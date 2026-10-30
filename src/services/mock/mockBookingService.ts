import type { Booking, BookingInput, DaySchedule, SlotInfo, User } from '@/types';
import { isActiveBookingStatus } from '@/lib/booking';
import {
  CLOSE_HOUR,
  MAX_PENDING_BOOKINGS,
  OPEN_HOUR,
  PENDING_TTL_HOURS,
  SLOT_HOURS,
} from '@/lib/constants';
import {
  formatHour,
  isValidDateString,
  wibDateTimeToDate,
} from '@/lib/datetime';
import type { BookingService } from '../types';
import { ServiceError } from '../types';
import {
  ensureSeedData,
  getSessionUser,
  readBookings,
  readClosedSlots,
  writeBookings,
  writeClosedSlots,
} from './db';
import { delay } from './delay';
import { publishBookingsChanged, subscribeToBookings } from './realtime';

function loadBookings(): Booking[] {
  ensureSeedData();
  const bookings = readBookings();
  const now = Date.now();
  let changed = false;

  const normalized = bookings.map((booking) => {
    if (booking.status !== 'pending') return booking;

    const expiry = booking.expiresAt
      ? Date.parse(booking.expiresAt)
      : wibDateTimeToDate(booking.date, booking.startHour).getTime();

    if (!Number.isFinite(expiry) || expiry > now) return booking;

    changed = true;
    return {
      ...booking,
      status: 'expired' as const,
      updatedAt: new Date(now).toISOString(),
    };
  });

  if (changed) writeBookings(normalized);
  return normalized;
}

function requireUser(): User {
  const user = getSessionUser();
  if (!user) {
    throw new ServiceError('unauthenticated', 'Silakan masuk terlebih dahulu.');
  }
  return user;
}

function requireOwner(): User {
  const user = requireUser();
  if (user.role !== 'owner') {
    throw new ServiceError('forbidden', 'Aksi ini hanya untuk owner.');
  }
  return user;
}

function sanitizeCount(value: number | undefined, label: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0 || count > 999) {
    throw new ServiceError('invalid_count', `${label} harus bilangan bulat 0–999.`);
  }
  return count;
}

function sortNewestFirst(a: Booking, b: Booking): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.startHour !== b.startHour) return b.startHour - a.startHour;
  return b.createdAt.localeCompare(a.createdAt);
}

function isHourOccupied(bookings: Booking[], date: string, hour: number): Booking | undefined {
  return bookings.find(
    (booking) =>
      booking.date === date &&
      isActiveBookingStatus(booking.status) &&
      booking.startHour <= hour &&
      hour < booking.startHour + booking.duration,
  );
}

export const mockBookingService: BookingService = {
  async getSchedule(date: string): Promise<DaySchedule> {
    await delay(120);
    if (!isValidDateString(date)) {
      throw new ServiceError('invalid_date', 'Tanggal tidak valid.');
    }

    const bookings = loadBookings();
    const closed = readClosedSlots()[date] ?? [];

    const slots: SlotInfo[] = SLOT_HOURS.map((hour) => {
      const booking = isHourOccupied(bookings, date, hour);
      if (booking) {
        return {
          hour,
          status: booking.status === 'pending' ? 'pending' : 'booked',
          bookingId: booking.id,
        };
      }
      if (closed.includes(hour)) return { hour, status: 'closed' };
      return { hour, status: 'available' };
    });

    return { date, slots };
  },

  async getBooking(id: string): Promise<Booking | null> {
    const user = requireUser();
    await delay(100);

    const booking = loadBookings().find((item) => item.id === id);
    if (!booking) return null;
    if (booking.userId !== user.id && user.role !== 'owner') {
      throw new ServiceError('forbidden', 'Booking ini bukan milik kamu.');
    }
    return booking;
  },

  async createBooking(input: BookingInput): Promise<Booking> {
    const user = requireUser();
    await delay(250);

    if (!isValidDateString(input.date)) {
      throw new ServiceError('invalid_date', 'Tanggal tidak valid.');
    }

    const startHour = Number(input.startHour);
    const duration = Number(input.duration);

    if (!Number.isInteger(startHour) || startHour < OPEN_HOUR || startHour >= CLOSE_HOUR) {
      throw new ServiceError('invalid_slot', 'Jam mulai tidak valid.');
    }
    if (!Number.isInteger(duration) || duration < 1) {
      throw new ServiceError('invalid_duration', 'Durasi minimal 1 jam.');
    }
    if (startHour + duration > CLOSE_HOUR) {
      throw new ServiceError(
        'invalid_duration',
        'Booking tidak boleh melewati pukul 21:00 WIB.',
      );
    }

    const startAt = wibDateTimeToDate(input.date, startHour);
    if (startAt.getTime() <= Date.now()) {
      throw new ServiceError('slot_past', 'Jam tersebut sudah lewat. Pilih jam lain.');
    }

    const shuttlecocks = sanitizeCount(input.shuttlecocks, 'Jumlah kok');
    const rackets = sanitizeCount(input.rackets, 'Jumlah raket');
    const note = input.note?.trim() || undefined;

    if (note && note.length > 300) {
      throw new ServiceError('note_too_long', 'Catatan maksimal 300 karakter.');
    }

    const bookings = loadBookings();
    const pendingCount = bookings.filter(
      (booking) => booking.userId === user.id && booking.status === 'pending',
    ).length;

    if (pendingCount >= MAX_PENDING_BOOKINGS) {
      throw new ServiceError(
        'too_many_pending',
        `Kamu sudah punya ${MAX_PENDING_BOOKINGS} booking menunggu verifikasi. Tunggu konfirmasi owner atau batalkan salah satu.`,
      );
    }

    const closed = readClosedSlots()[input.date] ?? [];

    for (let hour = startHour; hour < startHour + duration; hour += 1) {
      if (closed.includes(hour)) {
        throw new ServiceError(
          'slot_closed',
          `Slot ${formatHour(hour)} sedang ditutup oleh owner.`,
        );
      }

      const conflict = isHourOccupied(bookings, input.date, hour);
      if (conflict) {
        throw new ServiceError(
          'slot_taken',
          `Slot ${formatHour(hour)} sudah ${
            conflict.status === 'pending' ? 'menunggu verifikasi' : 'terbooking'
          }.`,
        );
      }
    }

    const now = Date.now();
    const expiresAt = new Date(
      Math.min(now + PENDING_TTL_HOURS * 3_600_000, startAt.getTime()),
    ).toISOString();

    const booking: Booking = {
      id: crypto.randomUUID(),
      date: input.date,
      startHour,
      duration,
      ...(shuttlecocks !== undefined ? { shuttlecocks } : {}),
      ...(rackets !== undefined ? { rackets } : {}),
      ...(note ? { note } : {}),
      status: 'pending',
      userId: user.id,
      userName: user.username,
      userEmail: user.email,
      createdAt: new Date(now).toISOString(),
      expiresAt,
    };

    writeBookings([...bookings, booking]);
    publishBookingsChanged();
    return booking;
  },

  async listUserBookings(): Promise<Booking[]> {
    const user = requireUser();
    await delay(120);
    return loadBookings()
      .filter((booking) => booking.userId === user.id)
      .sort(sortNewestFirst);
  },

  async listPendingBookings(): Promise<Booking[]> {
    requireOwner();
    await delay(120);
    return loadBookings()
      .filter((booking) => booking.status === 'pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listBookingsByDate(date: string): Promise<Booking[]> {
    requireOwner();
    await delay(120);
    if (!isValidDateString(date)) {
      throw new ServiceError('invalid_date', 'Tanggal tidak valid.');
    }
    return loadBookings()
      .filter((booking) => booking.date === date)
      .sort((a, b) => a.startHour - b.startHour || a.createdAt.localeCompare(b.createdAt));
  },

  async cancelBooking(id: string): Promise<Booking> {
    const user = requireUser();
    await delay(200);

    const bookings = loadBookings();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) {
      throw new ServiceError('not_found', 'Booking tidak ditemukan.');
    }

    const booking = bookings[index];
    if (booking.userId !== user.id && user.role !== 'owner') {
      throw new ServiceError('forbidden', 'Booking ini bukan milik kamu.');
    }
    if (booking.status !== 'pending') {
      throw new ServiceError(
        'invalid_status',
        'Hanya booking yang menunggu verifikasi yang bisa dibatalkan.',
      );
    }

    const updated: Booking = {
      ...booking,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    const next = [...bookings];
    next[index] = updated;
    writeBookings(next);
    publishBookingsChanged();
    return updated;
  },

  async confirmBooking(id: string): Promise<Booking> {
    requireOwner();
    await delay(200);

    const bookings = loadBookings();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) {
      throw new ServiceError('not_found', 'Booking tidak ditemukan.');
    }

    const booking = bookings[index];
    if (booking.status !== 'pending') {
      throw new ServiceError(
        'invalid_status',
        'Booking ini sudah tidak menunggu verifikasi (mungkin kadaluarsa).',
      );
    }

    const updated: Booking = {
      ...booking,
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
      expiresAt: undefined,
    };

    const next = [...bookings];
    next[index] = updated;
    writeBookings(next);
    publishBookingsChanged();
    return updated;
  },

  async rejectBooking(id: string, reason?: string): Promise<Booking> {
    requireOwner();
    await delay(200);

    const rejectionReason = reason?.trim() || undefined;
    if (rejectionReason && rejectionReason.length > 200) {
      throw new ServiceError('reason_too_long', 'Alasan penolakan maksimal 200 karakter.');
    }

    const bookings = loadBookings();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) {
      throw new ServiceError('not_found', 'Booking tidak ditemukan.');
    }

    const booking = bookings[index];
    if (booking.status !== 'pending') {
      throw new ServiceError('invalid_status', 'Booking ini sudah tidak menunggu verifikasi.');
    }

    const updated: Booking = {
      ...booking,
      status: 'rejected',
      updatedAt: new Date().toISOString(),
      expiresAt: undefined,
      rejectionReason,
    };

    const next = [...bookings];
    next[index] = updated;
    writeBookings(next);
    publishBookingsChanged();
    return updated;
  },

  async setSlotClosed(date: string, hour: number, closed: boolean): Promise<void> {
    requireOwner();
    await delay(150);

    if (!isValidDateString(date)) {
      throw new ServiceError('invalid_date', 'Tanggal tidak valid.');
    }
    if (!Number.isInteger(hour) || hour < OPEN_HOUR || hour >= CLOSE_HOUR) {
      throw new ServiceError('invalid_slot', 'Slot tidak valid.');
    }

    if (closed) {
      const conflict = isHourOccupied(loadBookings(), date, hour);
      if (conflict) {
        throw new ServiceError(
          'slot_taken',
          `Slot ${formatHour(hour)} masih terisi booking. Proses booking tersebut dulu.`,
        );
      }
    }

    const map = readClosedSlots();
    const slots = new Set(map[date] ?? []);

    if (closed) slots.add(hour);
    else slots.delete(hour);

    if (slots.size > 0) map[date] = Array.from(slots).sort((a, b) => a - b);
    else delete map[date];

    writeClosedSlots(map);
    publishBookingsChanged();
  },

  subscribe(listener): () => void {
    return subscribeToBookings(listener);
  },
};
