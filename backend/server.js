import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import midtransClient from 'midtrans-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Inisialisasi Midtrans Snap Client
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: isProduction ? 'production' : 'sandbox',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. Endpoint untuk membuat Midtrans Snap Token
 * POST /api/payment/create-snap-token
 */
app.post('/api/payment/create-snap-token', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone, description } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        error: 'orderId dan amount wajib diisi',
      });
    }

    const parameter = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: Math.round(Number(amount)),
      },
      item_details: [
        {
          id: String(orderId),
          price: Math.round(Number(amount)),
          quantity: 1,
          name: description ? String(description).substring(0, 50) : 'Sewa Unit Apartemen',
        },
      ],
      customer_details: {
        first_name: customerName || 'Resident',
        email: customerEmail || 'resident@greenview.com',
        phone: customerPhone || '08123456789',
      },
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error('Error creating snap transaction:', error);
    res.status(500).json({
      error: error.message || 'Gagal membuat Snap token',
    });
  }
});

/**
 * 2. Endpoint Webhook untuk menerima notifikasi status pembayaran dari Midtrans
 * POST /api/payment/notification
 */
app.post('/api/payment/notification', async (req, res) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    console.log(`[Midtrans Notification] Order: ${orderId} | Status: ${transactionStatus} | Type: ${paymentType}`);

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        // Pembayaran kartu kredit ditandai 'challenge' oleh FDS Midtrans
        console.log(`Order ${orderId} marked as challenge`);
      } else if (fraudStatus === 'accept') {
        // Pembayaran sukses
        console.log(`Order ${orderId} payment accepted/paid`);
      }
    } else if (transactionStatus === 'settlement') {
      // Pembayaran sukses (Transfer bank, QRIS, GoPay, dll)
      console.log(`Order ${orderId} settlement (lunas)`);
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      // Pembayaran gagal atau kedaluwarsa
      console.log(`Order ${orderId} cancelled/expired/denied`);
    } else if (transactionStatus === 'pending') {
      // Menunggu pembayaran dari pembeli
      console.log(`Order ${orderId} pending payment`);
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Error handling midtrans notification:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Midtrans Backend Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
  console.log(`Server Key: ${process.env.MIDTRANS_SERVER_KEY ? 'Configured ✅' : 'NOT CONFIGURED ⚠️'}\n`);
});

