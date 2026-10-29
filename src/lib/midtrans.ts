/**
 * Midtrans Snap Client Integration Helper
 * Mendukung Sandbox & Production Snap Popup / Redirect
 */

export interface SnapPayResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

export interface SnapCallbacks {
  onSuccess?: (result: SnapPayResult) => void;
  onPending?: (result: SnapPayResult) => void;
  onError?: (result: SnapPayResult) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks?: SnapCallbacks) => void;
      embed: (token: string, options: { embedId: string }) => void;
    };
  }
}

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

const SNAP_SCRIPT_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

let scriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Memuat script Midtrans Snap SDK ke dalam browser document
 */
export function loadSnapScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.snap) return Promise.resolve(true);

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    // Periksa apakah script tag sudah ada di DOM
    const existing = document.querySelector(`script[src="${SNAP_SCRIPT_URL}"]`);
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = SNAP_SCRIPT_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn('Gagal memuat Midtrans Snap SDK. Memastikan fallback lokal tetap aktif.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Menampilkan popup pembayaran Midtrans Snap
 */
export async function openSnapPayment(snapToken: string, callbacks?: SnapCallbacks): Promise<void> {
  const isLoaded = await loadSnapScript();

  if (!isLoaded || !window.snap) {
    throw new Error('Midtrans Snap SDK tidak berhasil dimuat.');
  }

  window.snap.pay(snapToken, callbacks);
}

