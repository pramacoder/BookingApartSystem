# Supabase Database Migration

File ini berisi SQL migration untuk membuat semua tabel database yang diperlukan untuk Apartment Management Website.

## Cara Menggunakan

### Opsi 1: Menggunakan Supabase Dashboard (Paling Mudah)

1. Buka project Anda di [Supabase Dashboard](https://app.supabase.com)
2. Pergi ke **SQL Editor**
3. Copy seluruh isi file `001_initial_schema.sql`
4. Paste ke SQL Editor
5. Klik **Run** untuk menjalankan migration

### Opsi 2: Menggunakan Supabase CLI

Jika Anda menggunakan Supabase CLI:

```bash
# Pastikan Anda sudah login
supabase login

# Link ke project Anda
supabase link --project-ref your-project-ref

# Jalankan migration
supabase db push
```

## Struktur Database

Migration ini akan membuat:

### User Management

- `users` - Tabel pengguna utama
- `residents` - Data residen (1:1 dengan users)
- `admins` - Data admin (1:1 dengan users)

### Units Management

- `units` - Data unit apartemen
- `unit_photos` - Foto-foto unit

### Payment Management

- `payments` - Data pembayaran/invoice
- `payment_transactions` - Transaksi pembayaran (termasuk Midtrans)

### Facilities Management

- `facilities` - Data fasilitas
- `facility_photos` - Foto-foto fasilitas
- `facility_bookings` - Pemesanan fasilitas

### Complaint/Ticket System

- `tickets` - Tiket komplain/request
- `ticket_updates` - Update/komentar pada tiket
- `ticket_attachments` - Lampiran tiket

### Announcements

- `announcements` - Pengumuman
- `announcement_reads` - Tracking pembacaan pengumuman

### Gallery

- `gallery_photos` - Foto galeri

### System

- `activity_logs` - Log aktivitas pengguna
- `notifications` - Notifikasi pengguna
- `system_settings` - Pengaturan sistem
- `otp_verifications` - Verifikasi OTP
- `sessions` - Sesi pengguna

## Fitur yang Termasuk

✅ Semua tabel dengan relasi foreign key yang benar
✅ Enums untuk tipe data yang konsisten
✅ Indexes untuk performa query yang optimal
✅ Triggers untuk auto-update `updated_at`
✅ Row Level Security (RLS) enabled (policies perlu dibuat sesuai kebutuhan)
✅ Unique constraints untuk data yang harus unik
✅ Check constraints untuk validasi data

## Catatan Penting

1. **RLS Policies**: Semua tabel sudah diaktifkan RLS, tapi policies belum dibuat. Anda perlu membuat policies sesuai kebutuhan aplikasi Anda.

2. **Authentication**: Supabase menggunakan tabel `auth.users` untuk authentication. Tabel `users` di sini adalah tabel custom yang bisa di-link dengan `auth.users` menggunakan trigger atau aplikasi logic.

3. **Password Hash**: Kolom `password_hash` di tabel `users` bisa digunakan jika Anda ingin custom authentication. Jika menggunakan Supabase Auth, Anda bisa menghapus kolom ini dan link `users.id` dengan `auth.users.id`.

## Langkah Selanjutnya

Setelah migration berhasil:

1. Buat RLS policies sesuai kebutuhan aplikasi
2. Buat trigger untuk sync `users` dengan `auth.users` (jika menggunakan Supabase Auth)
3. Insert data seed jika diperlukan
4. Test semua relasi dan constraints

## Troubleshooting

Jika ada error saat menjalankan migration:

1. Pastikan extension `uuid-ossp` dan `pgcrypto` sudah terinstall
2. Pastikan tidak ada tabel dengan nama yang sama
3. Cek apakah ada constraint yang conflict
4. Pastikan semua enum types sudah dibuat sebelum tabel yang menggunakannya
