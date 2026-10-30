import type { Booking, BookingInput, DaySchedule, User } from '@/types';

export type Unsubscribe = () => void;

export class ServiceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface AuthService {
  register(input: RegisterInput): Promise<User>;
  login(username: string, password: string): Promise<User>;
  logout(): Promise<void>;
  resetPassword(identifier: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthChange(listener: (user: User | null) => void): Unsubscribe;
}

export interface BookingService {
  getSchedule(date: string): Promise<DaySchedule>;
  getBooking(id: string): Promise<Booking | null>;
  createBooking(input: BookingInput): Promise<Booking>;
  listUserBookings(): Promise<Booking[]>;
  listPendingBookings(): Promise<Booking[]>;
  listBookingsByDate(date: string): Promise<Booking[]>;
  cancelBooking(id: string): Promise<Booking>;
  confirmBooking(id: string): Promise<Booking>;
  rejectBooking(id: string, reason?: string): Promise<Booking>;
  setSlotClosed(date: string, hour: number, closed: boolean): Promise<void>;
  subscribe(listener: () => void): Unsubscribe;
}
