import type { AuthService } from '../types';
import { ServiceError } from '../types';

function notImplemented(): never {
  throw new ServiceError(
    'not_implemented',
    'Mode Firebase belum diimplementasikan. Gunakan VITE_DATA_MODE=mock.',
  );
}

// TODO(Firebase): inisialisasi app + getAuth() saat SDK dipasang.
// TODO(Firebase): register memakai createUserWithEmailAndPassword lalu simpan profil
// (username, role "user") ke Firestore collection "users" dengan id = uid.
// TODO(Firebase): login memakai signInWithEmailAndPassword. Aplikasi memakai username,
// jadi perlu lookup dokumen "users" berdasarkan username sebelum login, atau simpan
// pemetaan username -> email di collection terpisah.
// TODO(Firebase): resetPassword memakai sendPasswordResetEmail setelah username
// diterjemahkan menjadi email.
// TODO(Firebase): getCurrentUser/onAuthChange memakai onAuthStateChanged dan membaca
// profil role dari Firestore.
export const firebaseAuthService: AuthService = {
  register: async () => notImplemented(),
  login: async () => notImplemented(),
  logout: async () => {
    notImplemented();
  },
  resetPassword: async () => {
    notImplemented();
  },
  getCurrentUser: async () => notImplemented(),
  onAuthChange: () => () => {},
};
