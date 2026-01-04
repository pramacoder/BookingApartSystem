# 🚀 Quick Deploy Guide

Panduan cepat untuk deploy project ke production.

## Prerequisites

- ✅ Node.js 20+ terinstall
- ✅ Akun Vercel (gratis di [vercel.com](https://vercel.com))
- ✅ Supabase project sudah setup
- ✅ Environment variables sudah dikonfigurasi

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login ke Vercel

```bash
vercel login
```

## Step 3: Deploy Frontend

```bash
# Di root project
vercel --prod
```

Ikuti instruksi:
- Set up and deploy? **Y**
- Which scope? Pilih akun Anda
- Link to existing project? **N** (untuk pertama kali)
- Project name? `apartment-management-frontend` (atau nama lain)
- Directory? `.` (root)
- Override settings? **N**

## Step 4: Setup Environment Variables (Frontend)

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project frontend
3. Settings → Environment Variables
4. Tambahkan:
   - `VITE_SUPABASE_URL` = URL Supabase Anda
   - `VITE_SUPABASE_ANON_KEY` = Anon key Supabase Anda
5. Redeploy project

## Step 5: Deploy Backend

```bash
cd backend
vercel --prod
```

Ikuti instruksi serupa seperti frontend.

## Step 6: Setup Environment Variables (Backend)

1. Buka project backend di Vercel Dashboard
2. Settings → Environment Variables
3. Tambahkan:
   - `SUPABASE_URL` = URL Supabase Anda
   - `SUPABASE_SERVICE_ROLE_KEY` = Service role key Supabase
   - `SUPABASE_ANON_KEY` = Anon key Supabase
   - `NEXT_PUBLIC_API_URL` = URL backend yang baru di-deploy (dari Vercel)
4. Redeploy project

## Step 7: Update Frontend dengan Backend URL

1. Buka project frontend di Vercel
2. Settings → Environment Variables
3. Tambahkan (jika perlu):
   - `VITE_API_URL` = URL backend yang baru di-deploy
4. Redeploy frontend

## ✅ Selesai!

Website Anda sekarang sudah live di:
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`

## Troubleshooting

### Build Error

Jika build error, check:
1. Environment variables sudah di-set
2. Node.js version compatible (20+)
3. Dependencies terinstall dengan benar

### CORS Error

Pastikan backend URL sudah di-set di frontend environment variables.

### Database Error

Pastikan:
1. Database migration sudah dijalankan di Supabase
2. RLS policies sudah di-setup
3. Supabase keys sudah benar

## Next Steps

- Setup custom domain (opsional)
- Setup monitoring dan error tracking
- Setup CI/CD dengan GitHub Actions (lihat `DEPLOYMENT.md`)

Untuk panduan lengkap, lihat `DEPLOYMENT.md`.

