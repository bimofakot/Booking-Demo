import type { User } from '@/types';
import { getSessionUser, STORAGE_KEYS } from './db';

type RealtimeMessage = {
  type: 'bookings' | 'auth';
  at: number;
};

const CHANNEL_NAME = 'gor-badminton-realtime';
const bookingListeners = new Set<() => void>();
const authListeners = new Set<(user: User | null) => void>();

const channel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

function fireBookings(): void {
  bookingListeners.forEach((listener) => listener());
}

function fireAuth(user: User | null): void {
  authListeners.forEach((listener) => listener(user));
}

if (channel) {
  channel.addEventListener('message', (event: MessageEvent<RealtimeMessage>) => {
    if (event.data?.type === 'bookings') fireBookings();
    else if (event.data?.type === 'auth') fireAuth(getSessionUser());
  });
} else if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.bookings || event.key === STORAGE_KEYS.closedSlots) {
      fireBookings();
    }
    if (event.key === STORAGE_KEYS.session) fireAuth(getSessionUser());
  });
}

export function publishBookingsChanged(): void {
  channel?.postMessage({ type: 'bookings', at: Date.now() } satisfies RealtimeMessage);
  fireBookings();
}

export function publishAuthChanged(user: User | null): void {
  channel?.postMessage({ type: 'auth', at: Date.now() } satisfies RealtimeMessage);
  fireAuth(user);
}

export function subscribeToBookings(listener: () => void): () => void {
  bookingListeners.add(listener);
  return () => {
    bookingListeners.delete(listener);
  };
}

export function subscribeToAuth(listener: (user: User | null) => void): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}
