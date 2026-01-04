# Quick Start Guide - Database Setup

## Langkah Cepat Setup Database

### 1. Jalankan Migration

**Via Supabase Dashboard (Paling Mudah):**
1. Buka project di https://app.supabase.com
2. Klik **SQL Editor** di sidebar
3. Copy seluruh isi file `001_initial_schema.sql`
4. Paste ke editor
5. Klik **Run** (atau Ctrl+Enter)

**Via Supabase CLI:**
```bash
supabase db push
```

### 2. Setup RLS Policies (Opsional tapi Disarankan)

Setelah migration berhasil, Anda bisa menambahkan RLS policies:

1. Buka **SQL Editor** lagi
2. Copy isi file `policies_example.sql`
3. Paste dan jalankan

**Catatan:** Policies di file contoh perlu disesuaikan dengan kebutuhan aplikasi Anda.

### 3. Verifikasi Setup

Jalankan query berikut untuk memastikan semua tabel sudah dibuat:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Anda harus melihat 21 tabel:
- admins
- announcement_reads
- announcements
- facility_bookings
- facility_photos
- facilities
- gallery_photos
- notifications
- otp_verifications
- payment_transactions
- payments
- residents
- sessions
- system_settings
- ticket_attachments
- ticket_updates
- tickets
- unit_photos
- units
- users
- activity_logs

### 4. Test Koneksi

Pastikan file `.env` sudah diisi dengan credentials Supabase Anda, lalu test koneksi dari aplikasi.

## Troubleshooting

**Error: extension "uuid-ossp" does not exist**
- Solusi: Extension ini seharusnya sudah otomatis dibuat di migration. Jika masih error, jalankan:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

**Error: relation already exists**
- Solusi: Tabel sudah ada. Hapus tabel yang ada atau gunakan `DROP TABLE IF EXISTS` sebelum create.

**Error: type already exists**
- Solusi: Enum type sudah ada. Hapus enum yang ada atau skip bagian CREATE TYPE.

## Next Steps

1. ✅ Database schema sudah siap
2. ⏭️ Buat RLS policies sesuai kebutuhan
3. ⏭️ Setup authentication (link dengan Supabase Auth jika perlu)
4. ⏭️ Insert seed data untuk testing
5. ⏭️ Test semua relasi dan constraints

## Struktur Relasi Utama

```
users (1) ──< (0..1) residents
users (1) ──< (0..1) admins
units (1) ──< (N) residents
units (1) ──< (N) payments
residents (1) ──< (N) payments
payments (1) ──< (N) payment_transactions
residents (1) ──< (N) facility_bookings
facilities (1) ──< (N) facility_bookings
residents (1) ──< (N) tickets
admins (1) ──< (N) tickets
```

Lihat `README.md` untuk dokumentasi lengkap.

