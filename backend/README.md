# Midtrans Backend Server

Backend server Express.js ini bertugas untuk mengintegrasikan sistem pembayaran Midtrans Snap secara aman:
1. **Generate Snap Token (`POST /api/payment/create-snap-token`)**: Menghasilkan token transaksi menggunakan `Server Key` rahasia Anda agar tidak terekspos di browser client.
2. **Handle Webhook (`POST /api/payment/notification`)**: Menerima notifikasi otomatis dari Midtrans saat status transaksi berubah (settlement/lunas, expired, cancelled).

---

## Cara Menjalankan Server

### 1. Masuk ke folder backend & Install dependensi
```bash
cd backend
npm install
```

### 2. Konfigurasi file `.env`
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka `.env` dan masukkan Server Key & Client Key dari Dashboard Midtrans Sandbox Anda:
```env
PORT=5000
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
```

### 3. Jalankan server
```bash
npm run dev
```
Server akan aktif di: `http://localhost:5000`

