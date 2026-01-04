# 📧 SMTP Quick Reference Guide

## ✅ Contoh Host yang Valid

### Format yang Diterima:
- ✅ `smtp.gmail.com` (domain name)
- ✅ `smtp-mail.outlook.com` (domain name)
- ✅ `192.168.1.1` (IP address)
- ✅ `mail.example.com` (subdomain)

### Format yang TIDAK Valid:
- ❌ `http://smtp.gmail.com` (jangan pakai http://)
- ❌ `https://smtp.gmail.com` (jangan pakai https://)
- ❌ `smtp.gmail.com:587` (port tidak perlu di host field)
- ❌ `smtp://smtp.gmail.com` (jangan pakai protocol prefix)

---

## 🔧 Konfigurasi SMTP untuk Provider Populer

### Gmail
```
Host: smtp.gmail.com
Port: 465 (SSL) atau 587 (TLS)
Username: your-email@gmail.com
Password: [App Password - lihat cara buat di bawah]
```

**Cara buat Gmail App Password:**
1. Buka Google Account → Security
2. Aktifkan 2-Step Verification (jika belum)
3. Klik "App passwords"
4. Pilih "Mail" dan device
5. Copy password yang dihasilkan (16 karakter)
6. Gunakan password ini di Supabase SMTP settings

---

### Outlook/Hotmail
```
Host: smtp-mail.outlook.com
Port: 587 (TLS)
Username: your-email@outlook.com
Password: [Password email Anda]
```

**Catatan:**
- Gunakan password email biasa (bukan App Password)
- Jika pakai 2FA, mungkin perlu App Password juga

---

### Yahoo Mail
```
Host: smtp.mail.yahoo.com
Port: 587 (TLS) atau 465 (SSL)
Username: your-email@yahoo.com
Password: [App Password - buat di Yahoo Account Security]
```

---

### SendGrid (Recommended untuk Production)
```
Host: smtp.sendgrid.net
Port: 587 (TLS)
Username: apikey
Password: [SendGrid API Key]
```

**Cara dapat API Key:**
1. Daftar di SendGrid (free tier tersedia)
2. Settings → API Keys → Create API Key
3. Copy API Key yang dihasilkan
4. Gunakan sebagai password di Supabase

---

### Zoho Mail
```
Host: smtp.zoho.com
Port: 587 (TLS)
Username: your-email@zoho.com
Password: [Password email Anda]
```

---

## 🧪 Test SMTP Configuration

Setelah mengisi form SMTP:

1. **Klik "Save" atau "Test Connection"** (jika ada)
2. **Cek apakah ada error:**
   - ✅ "SMTP settings saved successfully" → Berhasil!
   - ❌ "Authentication failed" → Username/password salah
   - ❌ "Connection timeout" → Host/port salah atau firewall
   - ❌ "Invalid host" → Format host tidak valid

3. **Test dengan registrasi user:**
   - Registrasi user baru
   - Cek email inbox (dan spam folder)
   - Jika email terkirim → SMTP berfungsi!

---

## ⚠️ Troubleshooting Host Field

### Error: "Must be a valid URL or IP address"

**Kemungkinan penyebab:**
- Format host tidak valid
- Ada prefix `http://` atau `https://`
- Ada port di host field (port harus di field terpisah)

**Solusi:**
- Hapus `http://` atau `https://` jika ada
- Hapus `:587` atau port lainnya dari host
- Gunakan hanya hostname atau IP address
- Contoh yang benar: `smtp.gmail.com` (bukan `smtp.gmail.com:587`)

### Error: "Connection failed"

**Kemungkinan penyebab:**
- Host salah atau tidak bisa diakses
- Port salah
- Firewall memblokir

**Solusi:**
- Pastikan host benar (cek dokumentasi provider)
- Coba port 587 (TLS) atau 465 (SSL)
- Test dengan telnet: `telnet smtp.gmail.com 587` (di terminal)

### Error: "Authentication failed"

**Kemungkinan penyebab:**
- Username/password salah
- Untuk Gmail: belum pakai App Password
- 2FA belum diaktifkan (untuk Gmail)

**Solusi:**
- Pastikan username dan password benar
- Untuk Gmail, gunakan App Password (bukan password biasa)
- Cek apakah provider memerlukan 2FA

---

## 📋 Checklist Konfigurasi SMTP

- [ ] Host sudah diisi dengan format yang benar (tanpa http:// atau port)
- [ ] Port sudah dipilih (587 untuk TLS atau 465 untuk SSL)
- [ ] Username sudah benar (email lengkap untuk Gmail/Outlook)
- [ ] Password sudah benar (App Password untuk Gmail)
- [ ] Test connection berhasil (jika ada fitur test)
- [ ] Email verification sudah diaktifkan di Authentication settings
- [ ] Test dengan registrasi user baru
- [ ] Email verifikasi terkirim dan bisa diklik

---

## 💡 Tips

1. **Untuk Development:**
   - Bisa nonaktifkan email verification dulu
   - Atau gunakan Gmail dengan App Password (gratis)

2. **Untuk Production:**
   - Gunakan SendGrid atau service profesional
   - Lebih reliable dan scalable
   - Free tier biasanya cukup untuk start

3. **Security:**
   - Jangan share App Password atau API Key
   - Rotate password secara berkala
   - Gunakan environment variables jika perlu

---

## 🔗 Resources

- [Supabase SMTP Documentation](https://supabase.com/docs/guides/auth/auth-smtp)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Documentation](https://docs.sendgrid.com/)





