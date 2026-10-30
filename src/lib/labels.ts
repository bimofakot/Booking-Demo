import type { BookingStatus, Role, SlotStatus } from '@/types';

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Menunggu verifikasi',
  confirmed: 'Terkonfirmasi',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
  expired: 'Kadaluarsa',
};

export const SLOT_STATUS_LABEL: Record<SlotStatus, string> = {
  available: 'Tersedia',
  pending: 'Menunggu verifikasi',
  booked: 'Terbooking',
  closed: 'Ditutup',
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner',
  user: 'User',
};
