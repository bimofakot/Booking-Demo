import type { BookingService } from '../types';
import { ServiceError } from '../types';

function notImplemented(): never {
  throw new ServiceError(
    'not_implemented',
    'Mode Firebase belum diimplementasikan. Gunakan VITE_DATA_MODE=mock.',
  );
}

// TODO(Firebase): model Firestore yang disarankan:
// - bookings/{bookingId}: tanggal (YYYY-MM-DD), startHour, duration, status, userId,
//   createdAt, expiresAt, plus field opsional baru tanpa migrasi skema.
// - closedSlots/{date}: array jam yang ditutup owner.
// - users/{uid}: profil publik + role.
// TODO(Firebase): penguncian slot pending harus memakai runTransaction agar dua user
// tidak mendapatkan jam yang sama. Baca semua booking aktif pada tanggal tersebut,
// validasi bentrok, lalu tulis booking pending + expiresAt (min 3 jam / jam mulai).
// TODO(Firebase): owner menerima/menolak dengan update status. Penolakan mengembalikan
// slot otomatis karena slot hanya dianggap terisi untuk status pending/confirmed.
// TODO(Firebase): subscribe memakai onSnapshot pada query bookings untuk tanggal aktif
// dan booking pending, lalu panggil listener setiap ada perubahan.
// TODO(Firebase): expired pending dapat ditandai saat dibaca (seperti mock) atau
// dijalankan sebagai scheduled function.
export const firebaseBookingService: BookingService = {
  getSchedule: async () => notImplemented(),
  getBooking: async () => notImplemented(),
  createBooking: async () => notImplemented(),
  listUserBookings: async () => notImplemented(),
  listPendingBookings: async () => notImplemented(),
  listBookingsByDate: async () => notImplemented(),
  cancelBooking: async () => notImplemented(),
  confirmBooking: async () => notImplemented(),
  rejectBooking: async () => notImplemented(),
  setSlotClosed: async () => {
    notImplemented();
  },
  subscribe: () => () => {},
};
