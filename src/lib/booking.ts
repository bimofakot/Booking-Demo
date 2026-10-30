import type { Booking, BookingStatus } from '@/types';
import { PRICE_PER_HOUR } from './constants';

export function isActiveBookingStatus(status: BookingStatus): boolean {
  return status === 'pending' || status === 'confirmed';
}

export function bookingEndHour(booking: Pick<Booking, 'startHour' | 'duration'>): number {
  return booking.startHour + booking.duration;
}

export function bookingPrice(booking: Pick<Booking, 'duration'>): number {
  return booking.duration * PRICE_PER_HOUR;
}

export function bookingCode(id: string): string {
  const clean = id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
  return `BK-${clean}`;
}
