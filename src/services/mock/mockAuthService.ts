import type { User } from '@/types';
import type { AuthService, RegisterInput } from '../types';
import { ServiceError } from '../types';
import {
  ensureSeedData,
  getSessionUser,
  readUsers,
  toPublicUser,
  writeSessionUserId,
  writeUsers,
  type StoredUser,
} from './db';
import { delay } from './delay';
import { publishAuthChanged, subscribeToAuth } from './realtime';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const mockAuthService: AuthService = {
  async register(input: RegisterInput): Promise<User> {
    await delay(250);
    ensureSeedData();

    const username = input.username.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!USERNAME_PATTERN.test(username)) {
      throw new ServiceError(
        'invalid_username',
        'Username 3–20 karakter, hanya huruf, angka, dan garis bawah.',
      );
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new ServiceError('invalid_email', 'Format email tidak valid.');
    }
    if (password.length < 6) {
      throw new ServiceError('weak_password', 'Password minimal 6 karakter.');
    }

    const users = readUsers();
    if (users.some((user) => user.username === username)) {
      throw new ServiceError('username_taken', 'Username sudah digunakan.');
    }
    if (users.some((user) => user.email.toLowerCase() === email)) {
      throw new ServiceError('email_taken', 'Email sudah terdaftar.');
    }

    const stored: StoredUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    writeUsers([...users, stored]);
    writeSessionUserId(stored.id);

    const user = toPublicUser(stored);
    publishAuthChanged(user);
    return user;
  },

  async login(username: string, password: string): Promise<User> {
    await delay(250);
    ensureSeedData();

    const key = username.trim().toLowerCase();
    const found = readUsers().find((user) => user.username === key);

    if (!found || found.password !== password) {
      throw new ServiceError('invalid_credentials', 'Username atau password salah.');
    }

    writeSessionUserId(found.id);
    const user = toPublicUser(found);
    publishAuthChanged(user);
    return user;
  },

  async logout(): Promise<void> {
    await delay(80);
    writeSessionUserId(null);
    publishAuthChanged(null);
  },

  async resetPassword(identifier: string): Promise<void> {
    await delay(450);
    if (!identifier.trim()) {
      throw new ServiceError('invalid_identifier', 'Masukkan username atau email.');
    }
    // Demo lokal: tidak ada email yang dikirim, pesan sukses tetap ditampilkan.
  },

  async getCurrentUser(): Promise<User | null> {
    ensureSeedData();
    await delay(60);
    return getSessionUser();
  },

  onAuthChange(listener): () => void {
    return subscribeToAuth(listener);
  },
};
