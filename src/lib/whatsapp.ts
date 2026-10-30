import type { Booking } from '@/types';
import { bookingCode, bookingPrice } from './booking';
import { OWNER_WHATSAPP, VENUE_NAME } from './constants';
import { formatDateLong, formatTimeRange } from './datetime';
import { formatCurrency } from './format';
import { BOOKING_STATUS_LABEL } from './labels';

export function isOwnerWhatsAppConfigured(): boolean {
  const digits = OWNER_WHATSAPP.replace(/\D/g, '');
  return /^\d{9,15}$/.test(digits) && !/[a-z]/i.test(OWNER_WHATSAPP);
}

export function buildBookingWhatsAppUrl(booking: Booking): string {
  const number = OWNER_WHATSAPP.replace(/\D/g, '');
  const lines = [
    `Halo owner ${VENUE_NAME}, saya sudah mengajukan booking lapangan.`,
    '',
    `Nama: ${booking.userName}`,
    `Tanggal: ${formatDateLong(booking.date)}`,
    `Jam: ${formatTimeRange(booking.startHour, booking.duration)} WIB`,
    `Durasi: ${booking.duration} jam`,
    `Jumlah kok: ${booking.shuttlecocks ?? '-'}`,
    `Jumlah raket: ${booking.rackets ?? '-'}`,
    `Total bayar di tempat: ${formatCurrency(bookingPrice(booking))}`,
    `Kode booking: ${bookingCode(booking.id)}`,
    `Status: ${BOOKING_STATUS_LABEL[booking.status]}`,
    '',
    'Mohon konfirmasinya. Terima kasih.',
  ];

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
}
