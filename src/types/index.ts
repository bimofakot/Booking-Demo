export type Role = 'owner' | 'user';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'expired';

export type SlotStatus = 'available' | 'pending' | 'booked' | 'closed';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Booking {
  id: string;
  date: string;
  startHour: number;
  duration: number;
  shuttlecocks?: number;
  rackets?: number;
  note?: string;
  status: BookingStatus;
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
}

export interface BookingInput {
  date: string;
  startHour: number;
  duration: number;
  shuttlecocks?: number;
  rackets?: number;
  note?: string;
}

export interface SlotInfo {
  hour: number;
  status: SlotStatus;
  bookingId?: string;
}

export interface DaySchedule {
  date: string;
  slots: SlotInfo[];
}
