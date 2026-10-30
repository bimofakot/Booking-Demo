import { firebaseAuthService } from './firebase/firebaseAuthService';
import { firebaseBookingService } from './firebase/firebaseBookingService';
import { mockAuthService } from './mock/mockAuthService';
import { mockBookingService } from './mock/mockBookingService';
import type { AuthService, BookingService } from './types';

export type DataMode = 'mock' | 'firebase';

const rawMode = (import.meta.env.VITE_DATA_MODE ?? 'mock').toLowerCase();
export const dataMode: DataMode = rawMode === 'firebase' ? 'firebase' : 'mock';

export const authService: AuthService =
  dataMode === 'firebase' ? firebaseAuthService : mockAuthService;

export const bookingService: BookingService =
  dataMode === 'firebase' ? firebaseBookingService : mockBookingService;

export { ServiceError } from './types';
export type { AuthService, BookingService, RegisterInput, Unsubscribe } from './types';
