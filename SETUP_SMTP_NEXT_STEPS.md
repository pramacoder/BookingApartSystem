# ✅ Langkah Selanjutnya Setelah Setup SMTP

## 📋 Checklist Setelah SMTP Setup

### Step 1: Aktifkan Email Verification ✅

1. Buka **Supabase Dashboard**
2. Pergi ke **Authentication** → **Settings**
3. Scroll ke bagian **Email Auth**
4. **Aktifkan** "Enable email confirmations"
5. **Save changes**

**Catatan:**

- Pastikan SMTP settings sudah tersimpan dengan benar
- Email verification harus diaktifkan agar email verifikasi terkirim

---

### Step 2: Test SMTP Configuration 🧪

**Cara 1: Test dengan Registrasi User Baru (Recommended)**

1. Buka aplikasi Anda di browser
2. Pergi ke halaman **Register** (`/register`)
3. Isi form registrasi dengan email yang valid
4. Submit form
5. **Cek email inbox** (dan **spam folder**)
6. Anda seharusnya menerima email verifikasi dari Supabase

**Cara 2: Test via Supabase Dashboard (Jika ada fitur test)**

1. Buka **Settings** → **Auth** → **SMTP Settings**
2. Cari tombol **"Test Connection"** atau **"Send Test Email"** (jika ada)
3. Klik dan cek email

---

### Step 3: Verifikasi Email 📧

1. **Buka email inbox** (cek juga spam folder)
2. Cari email dari Supabase dengan subject seperti:
   - "Confirm your signup"
   - "Verify your email"
   - "Confirm your email address"
3. **Klik link verifikasi** di email
4. Anda akan di-redirect ke halaman login atau halaman konfirmasi

**Jika email tidak terkirim:**

- Cek spam folder
- Tunggu beberapa menit (bisa delay)
- Cek SMTP settings lagi
- Lihat troubleshooting di bawah

---

### Step 4: Test Login 🔐

Setelah email diverifikasi:

1. Buka halaman **Login** (`/login`)
2. Masukkan **email** dan **password** yang digunakan saat registrasi
3. Klik **"Masuk"**
4. **Seharusnya bisa login** dan di-redirect ke dashboard

**Jika masih error:**

- Pastikan email sudah diklik link verifikasi
- Cek apakah user ada di `auth.users` (Supabase Dashboard → Authentication → Users)
- Lihat troubleshooting di bawah

---

### Step 5: Cek User di Database 📊

**Cek di Supabase Auth:**

1. Buka **Supabase Dashboard** → **Authentication** → **Users**
2. Cari email yang digunakan untuk registrasi
3. Status harus **"Confirmed"** (bukan "Unconfirmed")

**Cek di Tabel Users:**

1. Buka **Supabase Dashboard** → **Table Editor** → **users**
2. Cari email yang digunakan
3. User record seharusnya ada (jika RLS policy sudah dibuat)

---

## ⚠️ Troubleshooting

### Email Tidak Terkirim

**Kemungkinan penyebab:**

- SMTP settings salah
- Email masuk spam
- Rate limiting
- SMTP server down

**Solusi:**

1. **Cek SMTP settings:**

   - Pastikan Host, Port, Username, Password benar
   - Untuk Gmail: pastikan pakai App Password (bukan password biasa)

2. **Cek spam folder:**

   - Email verifikasi bisa masuk spam
   - Mark as "Not Spam" jika ditemukan

3. **Tunggu beberapa menit:**

   - Email bisa delay 1-5 menit
   - Cek lagi setelah beberapa menit

4. **Test SMTP connection:**

   - Coba kirim email dari email client lain dengan settings yang sama
   - Jika gagal, berarti SMTP settings salah

5. **Cek Supabase Logs:**
   - Buka **Supabase Dashboard** → **Logs**
   - Cari error terkait SMTP atau email

---

### Link Verifikasi Tidak Bekerja

**Kemungkinan penyebab:**

- Link expired (biasanya 24 jam)
- URL redirect salah
- Email verification sudah digunakan

**Solusi:**

1. **Request email baru:**

   - Buka halaman login
   - Klik "Resend verification email" (jika ada)
   - Atau registrasi ulang dengan email yang sama

2. **Cek URL redirect:**

   - Pastikan `emailRedirectTo` di code sudah benar
   - Biasanya: `http://localhost:3001/login` (untuk development)

3. **Cek apakah link sudah digunakan:**
   - Link verifikasi hanya bisa digunakan sekali
   - Jika sudah digunakan, user seharusnya sudah terverifikasi

---

### Masih Tidak Bisa Login Setelah Verifikasi

**Kemungkinan penyebab:**

- Email belum benar-benar terverifikasi
- Password salah
- User tidak ada di `auth.users`

**Solusi:**

1. **Cek status user:**

   - Buka **Supabase Dashboard** → **Authentication** → **Users**
   - Pastikan status **"Confirmed"** (bukan "Unconfirmed")

2. **Cek password:**

   - Pastikan password yang digunakan benar
   - Coba reset password jika perlu

3. **Cek browser console:**
   - Buka browser console (F12)
   - Cari error messages saat login
   - Error akan menunjukkan masalah spesifik

---

## 🎯 Next Steps Setelah Semua Berfungsi

Setelah SMTP dan email verification berfungsi:

1. **Test semua flow:**

   - ✅ Registrasi user baru
   - ✅ Verifikasi email
   - ✅ Login setelah verifikasi
   - ✅ Reset password (jika sudah diimplementasikan)

2. **Setup RLS Policies:**

   - Pastikan policy INSERT untuk tabel `users` sudah dibuat
   - File: `supabase/policies_users_insert.sql`

3. **Test dengan beberapa email:**

   - Test dengan Gmail, Outlook, dll
   - Pastikan email terkirim ke semua provider

4. **Production Preparation:**
   - Pertimbangkan menggunakan SendGrid atau service profesional
   - Setup email templates yang lebih baik
   - Monitor email delivery rates

---

## 📝 Catatan Penting

1. **Untuk Development:**

   - Bisa nonaktifkan email verification sementara untuk testing cepat
   - Tapi tetap test email verification sebelum production

2. **Untuk Production:**

   - Pastikan SMTP settings benar dan reliable
   - Monitor email delivery
   - Setup email templates yang professional
   - Pertimbangkan menggunakan email service profesional (SendGrid, Mailgun, dll)

3. **Security:**
   - Jangan share SMTP credentials
   - Rotate passwords secara berkala
   - Gunakan App Passwords untuk Gmail (bukan password biasa)

---

## ✅ Checklist Final

- [ ] SMTP settings sudah dikonfigurasi dan tersimpan
- [ ] Email verification sudah diaktifkan
- [ ] Test registrasi user baru berhasil
- [ ] Email verifikasi terkirim dan bisa dibuka
- [ ] Link verifikasi berfungsi dan user terverifikasi
- [ ] User bisa login setelah verifikasi
- [ ] User record ada di tabel `users` (jika RLS policy sudah dibuat)
- [ ] Tidak ada error di browser console
- [ ] Flow lengkap (register → verify → login) berfungsi

---

## 🆘 Masih Bermasalah?

Jika masih ada masalah setelah mengikuti langkah-langkah di atas:

1. **Cek browser console** untuk error messages
2. **Cek Supabase Dashboard** → **Logs** untuk error di server
3. **Test SMTP settings** dengan email client lain
4. **Cek dokumentasi Supabase** untuk update terbaru
5. **Nonaktifkan email verification sementara** untuk development (jika urgent)

---

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SMTP Guide](https://supabase.com/docs/guides/auth/auth-smtp)
- File: `SETUP_SMTP.md` - Panduan lengkap setup SMTP
- File: `TROUBLESHOOTING_AUTH.md` - Troubleshooting authentication
