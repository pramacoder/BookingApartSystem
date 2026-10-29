# 🏢 GreenView Apartment Management System

Sistem Manajemen Apartemen modern berbasis web (*Full-Stack*) yang dibangun dengan **React (Vite) + TypeScript + Tailwind CSS** dan menggunakan **PostgreSQL (Supabase)** sebagai satu-satunya sistem database utama, serta terintegrasi dengan **Midtrans Payment Gateway (Snap)** untuk transaksi pembayaran digital.

---

## 🌟 Fitur Utama

### 1. Portal Publik (Calon Penghuni)
- **Beranda & Profil Apartemen**: Showcase unit unggulan, fasilitas modern, denah lantai, dan testimoni.
- **Katalog Unit**: Pencarian dan filter unit apartemen berdasarkan tipe (Studio, 1BR, 2BR), harga sewa, dan lantai.
- **Booking Unit Online**: Reservasi unit dengan pilihan durasi sewa (Mingguan, Bulanan, Tahunan) dan kalkulasi otomatis deposit sewa.
- **Direktori Fasilitas & Galeri**: Eksplorasi fasilitas (Gym, Kolam Renang, Co-working Space, Function Hall) dan galeri foto interior/eksterior.
- **Halaman Kontak & Lokasi**: Formulir pesan dan peta lokasi.

### 2. Portal Penghuni (Resident Portal)
- **Resident Dashboard**: Informasi unit aktif, ringkasan tagihan berjalan, tiket komplain, dan pengumuman manajemen.
- **Unit Saya (My Unit)**: Detail spesifikasi unit, masa kontrak, status sewa, kontak darurat, dan informasi pengambilan kunci unit.
- **Payment Center**: Riwayat invoice, status pembayaran (Pending, Paid, Overdue), dan pembayaran sewa serta IPL.
- **Reservasi Fasilitas**: Jadwal ketersediaan fasilitas bersama, tarif per jam, dan pembuatan booking fasilitas baru dengan modal interaktif.
- **Live Chat dengan Pengelola**: Kirim dan terima pesan secara *real-time* ke pihak Customer Service / Admin Apartemen.
- **Komplain & Layanan Maintenance**: Pengajuan tiket kerusakan unit (AC, pipa, kartu akses) lengkap dengan status penanganan (*In Progress*, *Resolved*).
- **Pengumuman Manajemen**: Notifikasi kegiatan apartemen, jadwal pembersihan, dan pemeliharaan fasilitas.
- **Profil & Keamanan Akun**: Pengaturan profil penghuni dan perubahan password.

### 3. Portal Admin (Property Management)
- **Admin Dashboard**: Statistik okupansi gedung, grafik pendapatan bulanan, daftar komplain mendesak, dan aktivitas transaksi terbaru.
- **Manajemen Unit**: Tambah, edit, dan kelola status unit apartemen (*Available*, *Occupied*, *Maintenance*).
- **Direktori Penghuni**: Manajemen data penyewa aktif, unit yang dihuni, tanggal masa kontrak, dan informasi kontak darurat.
- **Monitoring Pembayaran**: Manajemen seluruh tagihan dan invoice, status verifikasi Midtrans, dan laporan keuangan.
- **Admin Live Chat**: Multitasking room chat dengan seluruh penghuni apartemen.
- **Manajemen Pengumuman & Konten Galeri**: Publikasi pengumuman baru dan upload dokumentasi kegiatan.

---

## 🛠️ Arsitektur Teknologi & Database

### 1. Standardisasi Satu Database: PostgreSQL (Supabase)
Sistem ini menggunakan **100% PostgreSQL** untuk seluruh penyimpanan data:
- Seluruh dependensi legacy Firebase telah dihapus sepenuhnya (*No Firebase*), menjaga ukuran bundle ringan dan performa kencang.
- Fitur percakapan real-time kini berjalan di atas tabel PostgreSQL (`chat_rooms` & `chat_messages`) memanfaatkan Supabase Realtime Channels.
- File migrasi database berada pada folder `supabase/migrations/`:
  1. `001_initial_schema.sql`: Skema dasar pengguna, unit, pembayaran, dan komplain.
  2. `002_unit_booking_schema.sql`: Skema durasi booking unit apartemen dan kontrak.
  3. `003_chat_schema.sql`: Skema percakapan chat resident-admin dan pesan real-time.

### 2. Integrasi Pembayaran Midtrans Snap
- Frontend terhubung dengan **Midtrans Snap SDK** untuk menampilkan popup metode pembayaran lengkap (Transfer Bank Virtual Account, Kartu Kredit, GoPay, QRIS, dll).
- Disediakan backend server Express.js di folder `backend/` untuk menghasilkan Snap Token secara aman menggunakan `SERVER_KEY` rahasia serta menerima Webhook Notification.
- Mendukung simulasi instan di lingkungan pengujian lokal (*Sandbox*).

### 3. Optimasi Gambar Otomatis (WebP on-the-fly)
- Dilengkapi modul `src/lib/imageOptimizer.ts` dan komponen `ImageWithFallback.tsx`.
- Gambar format JPG/PNG secara otomatis disajikan dalam format **WebP** melalui Image CDN (Unsplash engine / `wsrv.nl` CDN proxy) sebelum di-download pengguna, menghemat bandwidth hingga 50-70%.

---

## 🚀 Panduan Menjalankan Sistem

### Persyaratan Sistem
- Node.js versi 18+ atau 20+
- npm atau pnpm

### 1. Clone & Instalasi Frontend
```bash
# Clone repository
git clone https://github.com/pramacoder/BookingApartSystem.git
cd BookingApartSystem

# Install dependensi frontend
npm install
```

### 2. Konfigurasi Lingkungan Frontend (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi di file `.env`:
```env
# Supabase PostgreSQL Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Midtrans Configuration (Client Key untuk frontend)
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-your_client_key
VITE_MIDTRANS_IS_PRODUCTION=false
```

### 3. Jalankan Frontend (Development Server)
```bash
npm run dev
```
Aplikasi frontend akan aktif di: **`http://localhost:3000`**

---

### 4. Menjalankan Backend Midtrans (Opsional untuk Transaksi Riil Sandbox)
Untuk mengaktifkan popup pembayaran Midtrans Snap riil:
```bash
cd backend
npm install
cp .env.example .env
```
Isi `backend/.env` dengan `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` dari dashboard Midtrans Sandbox Anda, lalu jalankan:
```bash
npm run dev
```
Backend server akan aktif di: **`http://localhost:5000`**

---

## ⚡ Mode Akses Cepat (1-Click Demo Login)

Jika Anda ingin langsung meninjau seluruh fitur sistem tanpa perlu setup database terlebih dahulu:
1. Buka halaman login di `http://localhost:3000/login`.
2. Klik tombol **Demo Admin** untuk masuk sebagai Administrator pengelola gedung.
3. Klik tombol **Demo Resident** untuk masuk sebagai Penghuni unit apartemen.

---

## 📂 Struktur Direktori

```
BookingApartSystem/
├── backend/                   # Backend Express server (Midtrans Snap & Webhook)
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   └── server.js
├── public/                    # Aset statis & logo utama website
│   └── logo.png
├── src/
│   ├── assets/                # Logo & asset gambar
│   ├── components/            # Komponen UI (Navbar, Footer, Sidebar, Logo, Card)
│   ├── data/                  # Data mock cadangan offline & helper format
│   ├── hooks/                 # Custom React hooks (useAuth, useChat)
│   ├── lib/                   # Utilitas integrasi (Supabase, Auth, Database, Chat, Midtrans, ImageOptimizer)
│   ├── pages/                 # Halaman utama (Publik, Admin, Resident, Payment)
│   ├── App.tsx                # Rute aplikasi & proteksi role
│   └── main.tsx
├── supabase/
│   └── migrations/            # File SQL migrasi skema database PostgreSQL
├── index.html                 # Entry point HTML & konfigurasi favicon
├── package.json
├── vite.config.ts             # Konfigurasi Vite (Port 3000)
└── README.md
```

---

## 📄 Lisensi
Proyek ini dibuat untuk kebutuhan manajemen dan sistem reservasi apartemen modern.
