# Booking GOR Badminton

Aplikasi booking lapangan badminton (1 lapangan, slot per jam) untuk GOR. Saat ini berjalan **sepenuhnya lokal** dengan data tiruan (mock) di `localStorage` — belum terhubung ke Firebase dan belum aman untuk produksi.

> [!WARNING]
> **DEMO ONLY — JANGAN DIPAKAI UNTUK PRODUKSI.**
> Password disimpan apa adanya di `localStorage`, autentikasi bisa dimanipulasi lewat DevTools, dan tidak ada validasi di sisi server. Tahap ini hanya untuk mencoba alur UI/UX dan aturan bisnis. Firebase masih berupa kerangka (`src/services/firebase/`), belum diinstal dan belum diimplementasikan.

## Fitur

- **Jadwal publik**: ringkasan ketersediaan hari ini, navigasi kemarin/hari ini/besok + kalender, slot 07:00–21:00 dengan warna hijau (tersedia), kuning (menunggu verifikasi), merah (terisi), abu-abu (ditutup owner).
- **Booking**: pilih durasi beberapa jam sekaligus (hanya jika slot berurutan tersedia), isi jumlah kok/raket opsional dan catatan, bayar di tempat.
- **Verifikasi owner**: booking berstatus `pending` mengunci slot; owner menerima (`confirmed`) atau menolak (`rejected`) dengan alasan opsional. Pending kedaluwarsa otomatis setelah 3 jam atau saat jam mulai tiba (mana yang lebih dulu).
- **Akun**: register (hanya role user), login username + password, reset password mock, riwayat booking, batalkan booking pending, tombol tanya konfirmasi via WhatsApp.
- **Dashboard owner**: daftar pending real-time dengan badge + bunyi notifikasi, rekap harian, booking hari itu, tutup/buka slot manual.
- **Tampilan**: mobile-first, aksen hijau lapangan, 3 tema (Terang / Gelap / Ikuti Perangkat) tersimpan, PWA dapat dipasang ke layar HP.
- **Realtime antar-tab**: mock memakai `BroadcastChannel` (fallback ke event `storage`).

## Stack

- React 19 + TypeScript + Vite 7
- React Router 7
- Tailwind CSS 4 (`@tailwindcss/vite`)
- `vite-plugin-pwa` (Workbox)
- `lucide-react` (ikon), Plus Jakarta Sans (font)

## Prasyarat

- **Node.js 20.19+ atau 22.12+** (Vite 7). Repo ini diuji dengan Node 24.
- npm (sudah termasuk saat memasang Node.js).
- Browser modern (Chrome/Edge/Firefox/Safari terbaru).

## Menjalankan di Windows

Buka **PowerShell**, **Command Prompt**, atau **Git Bash** di folder proyek ini, lalu:

```powershell
# 1. (Opsional tapi disarankan) buat file .env dari contoh
copy .env.example .env

# 2. Pasang dependensi
npm install

# 3. Jalankan server development
npm run dev
```

Buka `http://localhost:5173`. Jika port 5173 dipakai, Vite memilih port lain — lihat URL di terminal.

Perintah lain:

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server development (hot reload) |
| `npm run build` | Type-check (`tsc -b`) + build produksi ke `dist/` |
| `npm run preview` | Menyajikan hasil build, **wajib** untuk menguji PWA/service worker |
| `npm run typecheck` | Type-check saja |
| `npm run icons` | Regenerasi ikon PWA placeholder di `public/icons/` |

> Service worker tidak aktif saat `npm run dev`. Untuk menguji install PWA, jalankan `npm run build` lalu `npm run preview`, buka `http://localhost:4173`.

## Akun demo

Dibuat otomatis saat aplikasi pertama kali dibuka:

| Peran | Username | Password | Email |
| --- | --- | --- | --- |
| Owner | `owner` | `owner123` | `owner@gor.local` |
| User | `budi` | `budi123` | `budi@gor.local` |

Data awal (selalu dibuat relatif terhadap hari ini):

- Hari ini: booking `confirmed` 09:00–11:00 dan 16:00–17:00, satu `rejected` 14:00, satu `cancelled` 12:00.
- Satu booking `pending` di slot kosong pertama setelah jam sekarang (atau besok 18:00 bila hari ini sudah lewat), supaya dashboard owner punya antrean verifikasi kapan pun dibuka.
- Kemarin: satu booking `expired` 07:00.
- Besok: booking `confirmed` 09:00.

Akun baru yang didaftarkan selalu berperan **user**; tidak ada pendaftaran owner dari UI.

## Konfigurasi `.env`

Salin `.env.example` menjadi `.env` (sudah masuk `.gitignore`), lalu sesuaikan:

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `VITE_DATA_MODE` | `mock` | `mock` atau `firebase` (firebase masih melempar `not_implemented`). |
| `VITE_OWNER_WHATSAPP` | `628xxxxxxxxxx` | Nomor WhatsApp owner format internasional tanpa `+`. Selama masih placeholder, UI menampilkan peringatan konfigurasi. |
| `VITE_PRICE_PER_HOUR` | `50000` | Tarif per jam (Rupiah), dipakai untuk estimasi "bayar di tempat". |
| `VITE_VENUE_NAME` | `GOR Badminton` | Nama venue pada UI dan pesan WhatsApp. |

Setelah mengubah `.env`, hentikan dan jalankan ulang `npm run dev`.

## Aturan bisnis yang diterapkan

- 1 lapangan, slot 1 jam, 07:00–21:00 (slot terakhir 20:00–21:00), zona waktu **Asia/Jakarta (WIB)**.
- Slot lampau tidak bisa dibooking; booking multi-jam hanya boleh jika **semua** slot berurutan tersedia dan tidak melewati 21:00.
- Booking baru berstatus `pending` dan langsung mengunci slot. Owner menerima → `confirmed`; menolak → `rejected` dan slot bebas kembali.
- Pending kedaluwarsa setelah **3 jam** atau tepat saat **jam mulai tiba**, mana yang lebih dulu. Pending kedaluwarsa dianggap tersedia saat jadwal dibaca.
- Maksimal **2 booking pending** per user.
- Tidak ada DP; pembayaran di tempat. Harga dihitung dari durasi yang dibooking, bukan jam yang terpakai.
- Owner dapat menutup/membuka slot manual (slot tutup berwarna abu-abu dan tidak bisa dibooking).

## Alur uji manual di browser

> Tips: buka **dua tab** (mis. satu mode normal, satu Incognito) untuk menguji realtime owner ↔ user. Gunakan DevTools → Application → Local Storage untuk melihat data mock.

### 1. Halaman publik (belum login)

1. Buka `/`. Ringkasan hari ini menampilkan "Ada N booking hari ini" atau "Belum ada booking hari ini"; slot 07:00–21:00 tampil (hijau/kuning/merah/abu-abu).
2. Klik panah kemarin/besok dan pilih tanggal lewat input kalender. Slot hari lampau tidak bisa dipesan (tombol nonaktif).
3. Klik slot **hijau** → muncul arahan untuk masuk. Klik "Masuk" → halaman login.
4. Buka menu tema di header, coba **Terang**, **Gelap**, **Ikuti Perangkat**. Pilih tema, refresh halaman — tema tetap sama tanpa kedip.

### 2. Login, register, lupa password

1. `/login` → coba `owner` / `owner123`; pastikan diarahkan ke dashboard owner dan menu menampilkan "Owner".
2. Logout lewat menu akun (pojok kanan atas) → "Keluar".
3. `/daftar` → daftar user baru (username unik, email valid, password ≥ 6, konfirmasi cocok). Pastikan tidak ada opsi owner. Setelah daftar, langsung masuk sebagai user.
4. Coba daftar dengan username/email yang sudah dipakai → muncul pesan kesalahan yang jelas.
5. `/lupa-password` → isi username/email → tampil pesan sukses tiruan. Tidak ada email yang benar-benar dikirim.

### 3. Booking + WhatsApp

1. Login sebagai `budi`, pilih tanggal besok, klik slot hijau (mis. 10:00).
2. Pilih durasi 2 jam; pastikan pilihan durasi mengikuti slot berurutan yang tersedia dan harga total (Rp) berubah sesuai jam.
3. Isi jumlah kok (opsional), raket (opsional), catatan. Kirim.
4. Halaman sukses menampilkan status pending, hitung mundur kedaluwarsa, rincian booking, dan tombol **Tanya konfirmasi via WhatsApp**. Jika `VITE_OWNER_WHATSAPP` masih placeholder, muncul peringatan.
5. Buka kembali `/` — slot yang dipesan berwarna **kuning** dan tidak bisa dipilih user lain.
6. Ulangi hingga user punya 2 pending → percobaan ketiga ditolak dengan pesan batas pending.

### 4. Riwayat & pembatalan (user)

1. Buka `/booking-saya`. Booking tampil beserta status, tanggal, jam, durasi, harga, dan sisa waktu pending.
2. Batalkan booking `pending` lewat tombol **Batalkan** → konfirmasi → status berubah `cancelled`, slot kembali hijau.
3. Tombol **Tanya konfirmasi via WhatsApp** membuka `wa.me/<nomor>` dengan teks berisi nama user, tanggal, jam, durasi, kok, dan raket.

### 5. Dashboard owner

1. Login `owner` → `/owner`.
2. Antrean **Menunggu verifikasi** tampil (termasuk booking yang baru dibuat user di tab lain, tanpa refresh).
3. Klik **Terima** → booking pindah ke daftar hari itu sebagai `confirmed`, slot jadi merah di halaman publik, rekap bertambah.
4. Klik **Tolak** → isi alasan (opsional) → status `rejected`, slot kembali hijau.
5. Rekap harian menunjukkan jumlah booking terkonfirmasi, jam, kok, raket, dan estimasi pendapatan.
6. Buka bagian **Kontrol slot**, tutup slot bebas → slot tampil abu-abu dan tidak bisa dipesan; buka kembali → hijau.
7. Nyalakan/matikan ikon bunyi. Saat booking baru masuk dari tab user, badge pending bertambah, muncul toast, dan (jika diizinkan browser) bunyi berbunyi.

### 6. Realtime & kedaluwarsa

1. Buka `/owner` di satu tab dan `/` atau form booking di tab lain (login user berbeda/Incognito).
2. Buat booking → dashboard owner ter-update tanpa refresh. Terima/tolak di owner → status di tab user ikut berubah.
3. Untuk menguji kedaluwarsa tanpa menunggu: buka DevTools → Application → Local Storage → `gor.v1.bookings`, ubah `expiresAt` sebuah booking `pending` ke waktu lampau, lalu refresh. Booking jadi `expired`, slot hijau kembali.

### 7. PWA

1. `npm run build` lalu `npm run preview`, buka `http://localhost:4173`.
2. Chrome/Edge desktop: ikon install di address bar (atau menu ⋮ → **Install app**). Di Android Chrome: menu → **Add to Home screen**. iOS Safari: Share → **Add to Home Screen**.
3. Buka aplikasi terpasang, pastikan tampil standalone (tanpa address bar) dan tema tetap.
4. Offline: buka DevTools → Network → centang **Offline**, refresh. Shell aplikasi tetap tampil (data mock tetap dari `localStorage`).

### 8. Build & pemeriksaan akhir

```powershell
npm run build
npm run preview
```

`npm run build` harus selesai tanpa error TypeScript. Periksa juga console browser tidak menampilkan error merah saat menelusuri halaman di atas.

## Reset data demo

Data mock memakai kunci `localStorage` berawalan `gor.v1.`:

- `gor.v1.users`, `gor.v1.session`, `gor.v1.bookings`, `gor.v1.closedSlots`, `gor.v1.seeded`, `gor.v1.theme`, `gor.v1.sound`.
- Cara termudah: DevTools → Application → Local Storage → klik kanan origin `localhost:5173` → **Clear**, lalu refresh. Seed dan akun demo dibuat ulang (pilihan tema ikut terhapus).
- Atau hapus semua data demo tetapi pertahankan tema, lewat Console:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith('gor.v1.') && key !== 'gor.v1.theme')
  .forEach((key) => localStorage.removeItem(key));
location.reload();
```

## Struktur folder

```
public/
  favicon.svg
  icons/                 # ikon PWA placeholder (192, 512, maskable, apple-touch)
scripts/
  generate-icons.mjs     # generator ikon PNG tanpa dependensi
src/
  components/
    auth/                # RequireAuth, AuthLayout
    booking/             # DateNav, SlotList, BookingDialog, BookingCard
    layout/              # Header, BottomNav, AppLayout
    owner/               # PendingBookingCard, RecapGrid, SlotControl
    ui/                  # Button, Card, Modal, Menu, Alert, dll.
  context/               # AuthContext, ThemeContext
  hooks/                 # useSchedule, useMyBookings, usePendingBookings, useOwnerDashboard, useNow
  lib/                   # konstanta, tanggal WIB, format, label, WhatsApp, bunyi
  pages/                 # Beranda, Login, Register, Lupa Password, Riwayat, Sukses, Dashboard Owner, 404
  services/
    types.ts             # interface AuthService & BookingService
    index.ts             # factory VITE_DATA_MODE
    mock/                # implementasi localStorage + BroadcastChannel
    firebase/            # kerangka + TODO (belum diimplementasikan)
  types/                 # tipe domain (User, Booking, SlotInfo, dst.)
  App.tsx
  main.tsx
```

**Aturan penting**: komponen UI tidak pernah menyentuh `localStorage`/Firebase langsung. Semua akses data lewat `authService` / `bookingService` dari `src/services/`, sehingga implementasi Firebase nanti bisa ditukar tanpa mengubah halaman.

## Catatan Firebase (tahap berikutnya)

Firebase **belum diinstal** dan sengaja dilewati. Kerangka di `src/services/firebase/` masih melempar error `not_implemented`. Rencana implementasi:

1. `npm install firebase`, buat proyek Firebase, aktifkan Authentication (email/password) dan Firestore.
2. Isi kredensial lewat `.env` (`VITE_FIREBASE_API_KEY`, dst.), jangan commit kredensial.
3. Ganti isi `firebaseAuthService.ts`: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `onAuthStateChanged`, `sendPasswordResetEmail`. Karena login memakai **username**, simpan pemetaan username → email di koleksi `users` dan gunakan email asli untuk auth.
4. Ganti isi `firebaseBookingService.ts` dengan koleksi `users`, `bookings`, `closedSlots`; gunakan transaksi untuk mengunci slot, `onSnapshot` untuk realtime, dan aturan keamanan Firestore untuk menegakkan batas pending/expiry di sisi server.
5. Pindahkan logika kedaluwarsa ke Cloud Function terjadwal atau validasi berbasis `expiresAt` di security rules, karena `localStorage` tidak ada di Firebase.
6. Set `VITE_DATA_MODE=firebase` setelah implementasi selesai.

## Troubleshooting

- **Port berbeda / halaman kosong**: pastikan membuka URL yang tercetak di terminal, bukan selalu 5173.
- **Muncul peringatan nomor WhatsApp**: isi `VITE_OWNER_WHATSAPP` di `.env` dengan nomor asli (contoh `6281234567890`), lalu restart dev server.
- **Data tidak berubah di tab lain**: `BroadcastChannel` hanya bekerja pada origin yang sama. Pastikan kedua tab memakai `localhost` (bukan campuran `127.0.0.1`).
- **Bunyi notifikasi tidak muncul**: browser memblokir audio sampai ada interaksi pengguna. Klik di halaman owner terlebih dahulu dan pastikan sakelar bunyi aktif.
- **PWA tidak bisa di-install**: harus lewat build/preview (HTTPS atau `localhost`), bukan `npm run dev`.
- **Ingin mulai dari nol**: lihat bagian **Reset data demo**.
