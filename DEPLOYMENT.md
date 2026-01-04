# Deployment Guide - Apartment Management Website

Panduan lengkap untuk deployment frontend dan backend ke production.

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
4. [Vercel Deployment](#vercel-deployment)
5. [Manual Deployment](#manual-deployment)
6. [CI/CD dengan GitHub Actions](#cicd-dengan-github-actions)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20+ terinstall
- Akun GitHub
- Akun Vercel (untuk deployment otomatis)
- Supabase project sudah setup
- Environment variables sudah dikonfigurasi

## Environment Variables

### Frontend (.env)

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (backend/.env)

Buat file `.env` di folder `backend/`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

Vercel adalah platform yang paling mudah untuk deploy Next.js dan Vite apps.

#### Frontend Deployment ke Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login ke Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy frontend:**
   ```bash
   vercel
   ```
   
   Atau deploy langsung ke production:
   ```bash
   vercel --prod
   ```

4. **Setup Environment Variables di Vercel Dashboard:**
   - Buka project di Vercel Dashboard
   - Settings → Environment Variables
   - Tambahkan:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

#### Backend Deployment ke Vercel

1. **Deploy backend:**
   ```bash
   cd backend
   vercel
   ```

2. **Setup Environment Variables:**
   - Buka backend project di Vercel Dashboard
   - Settings → Environment Variables
   - Tambahkan:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL` (URL backend yang sudah di-deploy)

### Option 2: GitHub Actions CI/CD

Setup otomatis deployment setiap push ke main branch.

#### Setup GitHub Secrets

1. Buka repository di GitHub
2. Settings → Secrets and variables → Actions
3. Tambahkan secrets berikut:

**Frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN` (dari Vercel → Settings → Tokens)
- `VERCEL_ORG_ID` (dari Vercel project settings)
- `VERCEL_PROJECT_ID` (dari Vercel project settings)

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `VERCEL_ORG_ID_BACKEND`
- `VERCEL_PROJECT_ID_BACKEND`

#### Workflow Otomatis

Setelah setup secrets, setiap push ke `main` branch akan:
1. Build frontend dan backend
2. Run tests (jika ada)
3. Deploy otomatis ke Vercel

### Option 3: Manual Deployment

#### Build Frontend

```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Output akan ada di folder dist/
```

#### Build Backend

```bash
cd backend

# Install dependencies
npm install

# Build untuk production
npm run build

# Output akan ada di folder backend/.next/
```

#### Deploy Build Files

Upload folder `dist/` (frontend) dan `backend/.next/` (backend) ke hosting provider Anda.

## Vercel Deployment (Step by Step)

### 1. Frontend Deployment

```bash
# Di root project
vercel login
vercel --prod
```

Atau via Vercel Dashboard:
1. Import project dari GitHub
2. Root Directory: `/` (root)
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Install Command: `npm install`

### 2. Backend Deployment

```bash
cd backend
vercel login
vercel --prod
```

Atau via Vercel Dashboard:
1. Import project dari GitHub
2. Root Directory: `/backend`
3. Framework Preset: Next.js
4. Build Command: `npm run build` (otomatis)
5. Install Command: `npm install`

## CI/CD dengan GitHub Actions

Workflow sudah disiapkan di `.github/workflows/ci-cd.yml`.

### Setup

1. **Push code ke GitHub:**
   ```bash
   git add .
   git commit -m "Setup CI/CD"
   git push origin main
   ```

2. **Setup GitHub Secrets** (seperti dijelaskan di atas)

3. **Workflow akan otomatis:**
   - Build frontend dan backend
   - Deploy ke Vercel saat push ke main branch

## Post-Deployment Checklist

- [ ] Frontend berhasil di-deploy dan bisa diakses
- [ ] Backend API berhasil di-deploy dan bisa diakses
- [ ] Environment variables sudah di-set di Vercel
- [ ] Database migration sudah dijalankan di Supabase
- [ ] RLS policies sudah di-setup
- [ ] Test semua fitur utama:
  - [ ] Login/Register
  - [ ] Dashboard
  - [ ] Payment flow
  - [ ] Facility booking
  - [ ] Ticket system

## Troubleshooting

### Build Error: Missing Environment Variables

**Problem:** Build gagal karena environment variables tidak ditemukan.

**Solution:**
- Pastikan semua environment variables sudah di-set di Vercel Dashboard
- Untuk local build, pastikan file `.env` ada dan terisi

### CORS Error

**Problem:** Frontend tidak bisa akses backend API.

**Solution:**
- Pastikan `NEXT_PUBLIC_API_URL` di backend mengarah ke URL yang benar
- Check CORS settings di `backend/next.config.js`

### Database Connection Error

**Problem:** Aplikasi tidak bisa connect ke Supabase.

**Solution:**
- Verifikasi Supabase URL dan keys
- Check RLS policies di Supabase
- Pastikan database migration sudah dijalankan

### Vercel Deployment Failed

**Problem:** Deployment gagal di Vercel.

**Solution:**
- Check build logs di Vercel Dashboard
- Pastikan Node.js version compatible (20+)
- Pastikan semua dependencies terinstall dengan benar

## Production Best Practices

1. **Environment Variables:**
   - Jangan commit `.env` files ke Git
   - Gunakan Vercel Environment Variables untuk production
   - Gunakan different keys untuk development dan production

2. **Security:**
   - Jangan expose Service Role Key di frontend
   - Gunakan RLS policies di Supabase
   - Enable HTTPS di production

3. **Performance:**
   - Enable Vercel Edge Functions jika perlu
   - Optimize images dan assets
   - Use CDN untuk static assets

4. **Monitoring:**
   - Setup error tracking (Sentry, dll)
   - Monitor API usage
   - Setup uptime monitoring

## Support

Jika ada masalah dengan deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

