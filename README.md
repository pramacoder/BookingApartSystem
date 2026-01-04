# Apartment Management Website

This is a code bundle for Apartment Management Website. The original project is available at https://www.figma.com/design/Z4qFo8niq7670lMudsNJ6N/Apartment-Management-Website.

## Setup Supabase

Project ini sudah terintegrasi dengan Supabase untuk backend dan authentication. Untuk menggunakan Supabase:

1. Buat project baru di [Supabase](https://app.supabase.com)
2. Dapatkan URL dan Anon Key dari dashboard project Anda
3. Buat file `.env` di root project dengan konten berikut:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Ganti `your_supabase_project_url` dan `your_supabase_anon_key` dengan nilai dari dashboard Supabase Anda

### Setup Database

1. Buka **SQL Editor** di Supabase Dashboard
2. Copy seluruh isi file `supabase/migrations/001_initial_schema.sql`
3. Paste dan jalankan di SQL Editor
4. Migration akan membuat semua tabel, relasi, indexes, dan triggers yang diperlukan

Lihat `supabase/README.md` untuk detail lebih lengkap tentang struktur database.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Development Status

⚠️ **Project masih dalam tahap development** - Fitur belum lengkap sepenuhnya.

### Fitur yang Sudah Lengkap

- ✅ Public pages (Home, Catalogue, Facilities, Login)
- ✅ Payment flow (Payment Center, Make Payment, Status Pages)
- ✅ Resident Dashboard
- ✅ Admin Dashboard
- ✅ Supabase integration & database schema

### Fitur yang Masih Perlu Dikembangkan

- 🚧 Authentication integration dengan Supabase
- 🚧 Resident features (My Unit, Bookings, Complaints, Profile)
- 🚧 Admin features (Unit Management, Resident Management, dll)
- 🚧 Payment integration (Midtrans)
- 🚧 File upload functionality

Lihat `DEVELOPMENT_ROADMAP.md` untuk roadmap lengkap dan `TODO_FEATURES.md` untuk checklist detail.

## Deployment

⚠️ **Deployment disarankan setelah fitur core selesai dikembangkan.**

Pipeline CI/CD sudah disiapkan untuk deployment nanti. Lihat `DEPLOYMENT.md` untuk panduan lengkap.

## Supabase Integration

Project ini menggunakan Supabase untuk:

- Authentication (login, register, logout)
- Database operations
- Real-time subscriptions

File konfigurasi Supabase berada di:

- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/auth.ts` - Authentication utilities

### Contoh penggunaan:

```typescript
import { supabase } from "./lib/supabase";
import { signIn, signUp, signOut } from "./lib/auth";

// Sign in
const { data, error } = await signIn("email@example.com", "password");

// Sign up
const { data, error } = await signUp("email@example.com", "password");

// Sign out
await signOut();
```
