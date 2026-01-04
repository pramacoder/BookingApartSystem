# 🔧 Troubleshooting Authentication Issues

## Masalah: Registrasi Berhasil Tapi Tidak Bisa Login

### Kemungkinan Penyebab:

1. **Email Verification Diaktifkan (PALING UMUM)**
   - Supabase memerlukan email verification sebelum user bisa login
   - User sudah terdaftar di `auth.users` tapi belum terverifikasi
   - **Solusi cepat**: Nonaktifkan email verification untuk development
   - **Solusi proper**: Setup SMTP dan verifikasi email

2. **RLS Policy Tidak Ada**
   - Tabel `users` memerlukan policy INSERT agar user bisa membuat record
   - Policy INSERT belum dibuat di database

3. **User Record Tidak Dibuat**
   - Error saat insert ke tabel `users` tidak ditampilkan
   - Cek browser console (F12) untuk error details

---

## ✅ Solusi Step-by-Step

### Step 1: Cek Email Verification

**Opsi A: Nonaktifkan Email Verification (untuk development)**
1. Buka Supabase Dashboard → Authentication → Settings
2. Scroll ke "Email Auth"
3. Nonaktifkan "Enable email confirmations"
4. Save changes

**Opsi B: Verifikasi Email**
1. Cek email inbox (dan spam folder)
2. Klik link verifikasi di email
3. Coba login lagi

---

### Step 2: Tambahkan RLS Policy untuk INSERT

**Jalankan SQL ini di Supabase SQL Editor:**

```sql
-- Pastikan RLS sudah diaktifkan
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Tambahkan policy untuk INSERT
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text);
```

**Atau gunakan file yang sudah disediakan:**
- File: `supabase/policies_users_insert.sql`
- Copy isinya dan jalankan di Supabase SQL Editor

---

### Step 3: Cek Browser Console

1. Buka browser console (F12 → Console tab)
2. Coba registrasi lagi
3. Cari error messages yang muncul
4. Error yang mungkin muncul:
   - `RLS policy violation` → Perlu tambahkan policy INSERT
   - `permission denied` → Perlu tambahkan policy INSERT
   - `Email not confirmed` → Perlu verifikasi email atau nonaktifkan

---

### Step 4: Cek Database

**Cek apakah user ada di `auth.users`:**
1. Buka Supabase Dashboard → Authentication → Users
2. Cari email yang digunakan untuk registrasi
3. Jika ada → User sudah terdaftar di Supabase Auth
4. Jika tidak ada → Ada masalah dengan registrasi

**Cek apakah user ada di tabel `users`:**
1. Buka Supabase Dashboard → Table Editor → `users`
2. Cari email yang digunakan
3. Jika tidak ada → User record tidak dibuat (kemungkinan RLS policy)

---

### Step 5: Test dengan User yang Dibuat Manual

Jika user dibuat manual di database tapi tetap tidak bisa login:

1. **Cek apakah user ada di `auth.users`:**
   - User yang dibuat manual di tabel `users` TIDAK otomatis ada di `auth.users`
   - Supabase Auth menggunakan tabel `auth.users` yang terpisah

2. **Buat user melalui Supabase Auth:**
   - Gunakan Supabase Dashboard → Authentication → Users → Add User
   - Atau gunakan API untuk create user

---

## 🐛 Debug Mode

Untuk melihat error lebih detail, buka browser console (F12) dan cari:
- `Signup successful` → Registrasi berhasil
- `User record created successfully` → Record di tabel users berhasil dibuat
- `Error inserting user record` → Ada error saat insert ke tabel users
- `RLS Policy Error` → Perlu tambahkan policy INSERT

---

## 📋 Checklist

- [ ] Email verification sudah dinonaktifkan atau email sudah diverifikasi
- [ ] RLS policy INSERT sudah dibuat untuk tabel `users`
- [ ] User ada di `auth.users` (Supabase Dashboard → Authentication → Users)
- [ ] User ada di tabel `users` (Supabase Dashboard → Table Editor)
- [ ] Tidak ada error di browser console
- [ ] Password yang digunakan benar

---

## 🔍 Common Errors

### Error: "Email atau password salah"
**Kemungkinan:**
- Email belum terverifikasi
- Password salah
- User tidak ada di `auth.users`

**Solusi:**
- Verifikasi email atau nonaktifkan email verification
- Pastikan password benar
- Cek apakah user ada di Authentication → Users

### Error: "RLS policy violation" atau "permission denied"
**Kemungkinan:**
- Policy INSERT belum dibuat
- RLS diaktifkan tapi policy tidak ada

**Solusi:**
- Jalankan SQL untuk membuat policy INSERT (lihat Step 2)

### Error: User tidak muncul di tabel `users`
**Kemungkinan:**
- RLS policy memblokir INSERT
- Error saat insert tidak ditampilkan

**Solusi:**
- Cek browser console untuk error details
- Tambahkan policy INSERT
- Cek apakah user ada di `auth.users` (ini yang penting untuk login)

---

## 💡 Tips

1. **Untuk Development:**
   - Nonaktifkan email verification
   - Gunakan policy yang lebih permisif (atau nonaktifkan RLS sementara)

2. **Untuk Production:**
   - Aktifkan email verification
   - Gunakan RLS policies yang ketat
   - Test semua flow dengan baik

3. **Testing:**
   - Selalu cek browser console untuk error
   - Cek Supabase Dashboard untuk melihat data
   - Test dengan user baru dan user yang sudah ada

---

## 📞 Masih Bermasalah?

Jika masih bermasalah setelah mengikuti langkah-langkah di atas:

1. Cek browser console untuk error messages
2. Cek Supabase Dashboard → Logs untuk error di server
3. Pastikan semua environment variables sudah benar
4. Coba dengan user baru untuk test

