# 📧 Setup SMTP untuk Email Verification

## Apakah SMTP Diperlukan?

**Ya, SMTP diperlukan jika:**

- Email verification diaktifkan di Supabase
- Anda ingin user menerima email verifikasi
- Anda ingin menggunakan email custom (bukan default Supabase)

**Tidak diperlukan jika:**

- Email verification dinonaktifkan (untuk development)
- Anda menggunakan Supabase's built-in email service (terbatas)

---

## 🚀 Opsi 1: Nonaktifkan Email Verification (Development)

**Cara termudah untuk development:**

1. Buka Supabase Dashboard
2. Pergi ke **Authentication** → **Settings**
3. Scroll ke bagian **Email Auth**
4. **Nonaktifkan** "Enable email confirmations"
5. Save changes

**Setelah ini:**

- User bisa langsung login setelah registrasi
- Tidak perlu verifikasi email
- Cocok untuk development/testing

---

## 📧 Opsi 2: Setup SMTP (Production/Testing Email)

Jika Anda ingin test email verification dengan SMTP:

### Step 1: Konfigurasi SMTP di Supabase

1. Buka Supabase Dashboard
2. Pergi ke **Settings** → **Auth** → **SMTP Settings**
3. Isi form SMTP:

   **Host (PENTING - harus valid URL atau IP address):**

   - Gmail: `smtp.gmail.com`
   - Outlook/Hotmail: `smtp-mail.outlook.com`
   - Yahoo: `smtp.mail.yahoo.com`
   - SendGrid: `smtp.sendgrid.net`
   - Custom SMTP: Masukkan hostname atau IP address server SMTP Anda
   - **Format**: Bisa berupa domain (contoh: `smtp.example.com`) atau IP address (contoh: `192.168.1.1`)
   - **Jangan gunakan**: `http://` atau `https://` prefix, hanya hostname/IP saja

   **Port:**

   - `465` (SSL) - Recommended untuk Gmail
   - `587` (TLS) - Recommended untuk Outlook dan kebanyakan provider
   - `25` - Tidak disarankan (sering diblokir)

   **Username:**

   - Gmail: Email lengkap Anda (contoh: `yourname@gmail.com`)
   - Outlook: Email lengkap Anda (contoh: `yourname@outlook.com`)
   - SendGrid: `apikey` (literal text "apikey")
   - Custom: Username yang diberikan provider SMTP

   **Password:**

   - Gmail: **App Password** (bukan password biasa - lihat Step 2)
   - Outlook: Password email Anda
   - SendGrid: API Key dari SendGrid
   - Custom: Password yang diberikan provider SMTP

   **Minimum interval**: `60` seconds (default, bisa disesuaikan)

### Step 2: Setup Gmail App Password (jika pakai Gmail)

1. Buka Google Account Settings
2. Pergi ke **Security**
3. Aktifkan **2-Step Verification** (jika belum)
4. Pergi ke **App passwords**
5. Buat app password baru untuk "Mail"
6. Copy password yang dihasilkan
7. Gunakan password ini di Supabase SMTP settings

**Catatan:**

- Gmail tidak bisa pakai password biasa untuk SMTP
- Harus pakai App Password
- Atau gunakan OAuth2 (lebih kompleks)

### Step 3: Test Email

1. Aktifkan email verification:
   - **Authentication** → **Settings** → **Email Auth**
   - Aktifkan "Enable email confirmations"
2. Coba registrasi dengan email yang valid
3. Cek email inbox (dan spam folder)
4. Klik link verifikasi

---

## 🔧 Opsi 3: Gunakan Email Service Lain

### Gmail SMTP Settings:

```
Host: smtp.gmail.com
Port: 465 (SSL) atau 587 (TLS)
Username: your-email@gmail.com
Password: App Password (bukan password biasa)
```

### Outlook/Hotmail SMTP Settings:

```
Host: smtp-mail.outlook.com
Port: 587 (TLS)
Username: your-email@outlook.com
Password: Password Anda
```

### SendGrid (Recommended untuk Production):

1. Daftar di SendGrid (free tier tersedia)
2. Buat API Key
3. Gunakan SMTP settings dari SendGrid:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   ```

---

## ⚠️ Troubleshooting SMTP

### Error: "Authentication failed"

**Kemungkinan:**

- Username/password salah
- Untuk Gmail: belum pakai App Password
- 2FA belum diaktifkan (untuk Gmail)

**Solusi:**

- Pastikan username dan password benar
- Untuk Gmail, gunakan App Password
- Cek apakah email service memerlukan 2FA

### Error: "Connection timeout"

**Kemungkinan:**

- Port salah
- Firewall memblokir
- Host salah

**Solusi:**

- Coba port 587 (TLS) atau 465 (SSL)
- Cek firewall settings
- Pastikan hostname benar

### Email tidak terkirim

**Kemungkinan:**

- SMTP settings salah
- Email masuk spam
- Rate limit tercapai

**Solusi:**

- Test SMTP settings dengan email client lain
- Cek spam folder
- Tunggu beberapa menit (rate limiting)

---

## 💡 Rekomendasi

### Untuk Development:

✅ **Nonaktifkan email verification** - Paling mudah dan cepat

### Untuk Testing Email:

✅ **Setup SMTP dengan Gmail App Password** - Gratis dan mudah

### Untuk Production:

✅ **Gunakan SendGrid atau service profesional** - Lebih reliable dan scalable

---

## 📋 Checklist Setup SMTP

- [ ] Email verification diaktifkan di Supabase
- [ ] SMTP settings sudah dikonfigurasi
- [ ] Test email berhasil terkirim
- [ ] Link verifikasi bisa diklik dan berfungsi
- [ ] User bisa login setelah verifikasi

---

## 🔍 Test Email Verification

Setelah setup SMTP:

1. **Registrasi user baru**
2. **Cek email inbox** (dan spam folder)
3. **Klik link verifikasi** di email
4. **Coba login** dengan email dan password
5. **Seharusnya bisa login** setelah verifikasi

---

## 📞 Masih Bermasalah?

Jika email tidak terkirim:

1. Cek SMTP settings di Supabase Dashboard
2. Test dengan email client lain (Outlook, Thunderbird)
3. Cek Supabase logs untuk error
4. Pastikan email service tidak memblokir

Jika link verifikasi tidak bekerja:

1. Pastikan URL redirect sudah benar di Supabase settings
2. Cek apakah link expired (biasanya 24 jam)
3. Coba request email verifikasi baru
