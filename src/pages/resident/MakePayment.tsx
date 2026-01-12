import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../../data/mockData';
import { CreditCard, Building2, Calendar, Tag, Shield, ArrowRight, Check, Loader2, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUnitBookingById, getUnitWithPhotos, createPayment, updatePaymentStatus, updateUnitBooking, updateResident, updateUnit } from '../../lib/database';
import { createNotification } from '../../lib/firestore';
import type { UnitBooking, Unit } from '../../lib/types/database';

export function MakePayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'bank' | 'ewallet'>('credit');
  const [promoCode, setPromoCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if this is a unit booking payment
  const isUnitBooking = location.pathname.includes('/unit-booking/');
  const [unitBooking, setUnitBooking] = useState<UnitBooking | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [regularPayment, setRegularPayment] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isUnitBooking && id) {
      loadUnitBookingPayment(id);
    } else if (id) {
      // Load regular payment (existing flow)
      loadRegularPayment(id);
    } else {
      setError('Payment ID tidak ditemukan');
      setLoading(false);
    }
  }, [id, isUnitBooking, user, navigate]);

  const loadUnitBookingPayment = async (bookingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: booking, error: bookingError } = await getUnitBookingById(bookingId);
      if (bookingError || !booking) {
        throw new Error('Unit booking tidak ditemukan');
      }

      // Verify booking belongs to user's resident
      if (booking.resident_id && user) {
        // This check might need adjustment based on your auth setup
        // For now, we'll proceed
      }

      setUnitBooking(booking);

      // Load unit details
      const { data: unitData, error: unitError } = await getUnitWithPhotos(booking.unit_id);
      if (!unitError && unitData) {
        setUnit(unitData.unit);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading unit booking:', err);
      setError(err.message || 'Gagal memuat data booking');
      setLoading(false);
    }
  };

  const loadRegularPayment = async (paymentId: string) => {
    // TODO: Load regular payment from Supabase
    // For now, keep existing mock data behavior
    setRegularPayment({ id: paymentId, amount: 0 });
    setLoading(false);
  };

  const handleProceedPayment = async () => {
    if (!agreedToTerms) {
      setError('Silakan setujui syarat & ketentuan terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (isUnitBooking && unitBooking) {
        await handleUnitBookingPayment();
      } else {
        await handleRegularPayment();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Gagal memproses pembayaran. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  const handleUnitBookingPayment = async () => {
    if (!unitBooking || !user) return;

    // Create payment record in Supabase
    const residentId = unitBooking.resident_id;
    
    const { data: paymentRecord, error: paymentError } = await createPayment({
      resident_id: residentId,
      unit_id: unitBooking.unit_id,
      payment_type: 'unit_booking',
      amount: unitBooking.rent_amount,
      admin_fee: unitBooking.admin_fee,
      discount: 0,
      penalty: 0,
      due_date: new Date().toISOString().split('T')[0],
    });

    if (paymentError || !paymentRecord) {
      throw new Error('Gagal membuat record pembayaran');
    }

    // Simulate payment processing (in production, integrate with Midtrans)
    // For now, simulate success after 2 seconds
    setTimeout(async () => {
      try {
        // Update unit booking status
        await updateUnitBooking(unitBooking.id, {
          status: 'confirmed',
          payment_status: 'paid',
          confirmed_at: new Date().toISOString(),
        });

        // Assign unit to resident
        await updateResident(residentId, {
          unit_id: unitBooking.unit_id,
          status: 'active',
          unit_booking_id: unitBooking.id,
          contract_start: unitBooking.start_date,
          contract_end: unitBooking.end_date,
          move_in_date: new Date().toISOString().split('T')[0],
        });

        // Update unit status to occupied
        await updateUnit(unitBooking.unit_id, {
          status: 'occupied',
        });

        // Create notification for key pickup
        try {
          await createNotification(
            user.id,
            'key_pickup',
            'Kunci Unit Siap Diambil',
            `Unit ${unit?.unit_number || ''} telah ditetapkan untuk Anda. Silakan ambil kunci unit di kantor administrasi.`,
            {
              unit_id: unitBooking.unit_id,
              unit_number: unit?.unit_number,
              booking_id: unitBooking.id,
            }
          );
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
          // Continue even if notification fails
        }

        // Update payment status
        await updatePaymentStatus(paymentRecord.id, 'paid', new Date().toISOString().split('T')[0]);

        // Redirect to success page
        navigate(`/payment/success?order_id=${unitBooking.booking_number}&type=unit_booking`);
      } catch (err: any) {
        console.error('Error completing payment:', err);
        setError('Pembayaran berhasil, namun terjadi error saat memproses. Silakan hubungi admin.');
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleRegularPayment = async () => {
    // TODO: Implement regular payment flow
    // For now, simulate redirect
    setTimeout(() => {
      const outcomes = ['success', 'failed', 'pending'];
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      navigate(`/payment/${randomOutcome}?order_id=${id}`);
    }, 2000);
  };

  // Get payment details based on type
  const payment = isUnitBooking ? {
    invoiceNumber: unitBooking?.booking_number || '',
    amount: unitBooking?.total_amount || 0,
    unitNumber: unit?.unit_number || '',
    dueDate: new Date().toLocaleDateString('id-ID'),
    description: `Pembayaran booking unit ${unit?.unit_number || ''} (${unitBooking?.booking_duration_type || ''})`,
  } : regularPayment;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-primary mb-2">Error</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button onClick={() => navigate('/resident/payment')} className="btn-primary">
            Kembali ke Payment Center
          </button>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const adminFee = isUnitBooking ? (unitBooking?.admin_fee || 2500) : 2500;
  const discount = 0;
  const total = payment.amount + adminFee - discount;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-primary mb-2">Make Payment</h2>
        <p className="text-text-secondary">Review and complete your payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <div className="card p-6">
            <h3 className="text-primary mb-4">Invoice Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Invoice Number</p>
                  <p className="text-primary">{payment.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary mb-1">Unit</p>
                  <p className="text-primary">{payment.unitNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <Calendar className="w-4 h-4" />
                <span>Due Date: {payment.dueDate}</span>
              </div>

              <div>
                <p className="text-sm text-text-secondary mb-2">Description</p>
                <p className="text-primary">{payment.description}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="card p-6">
            <h3 className="text-primary mb-4">Select Payment Method</h3>

            <div className="space-y-3">
              {/* Credit Card */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'credit'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  checked={paymentMethod === 'credit'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-5 h-5 text-primary"
                />
                <CreditCard className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="text-primary">Credit / Debit Card</p>
                  <p className="text-sm text-text-secondary">Visa, Mastercard, JCB</p>
                </div>
                {paymentMethod === 'credit' && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </label>

              {/* Bank Transfer */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-5 h-5 text-primary"
                />
                <Building2 className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="text-primary">Bank Transfer</p>
                  <p className="text-sm text-text-secondary">BCA, Mandiri, BNI, BRI</p>
                </div>
                {paymentMethod === 'bank' && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </label>

              {/* E-Wallet */}
              <label
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'ewallet'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="ewallet"
                  checked={paymentMethod === 'ewallet'}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-2xl">💰</span>
                <div className="flex-1">
                  <p className="text-primary">E-Wallet</p>
                  <p className="text-sm text-text-secondary">GoPay, OVO, Dana, ShopeePay</p>
                </div>
                {paymentMethod === 'ewallet' && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </label>
            </div>
          </div>

          {/* Promo Code */}
          <div className="card p-6">
            <h3 className="text-primary mb-4">Promo Code</h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Tag className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
              <button className="btn-outline px-6">
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-primary mb-6">Payment Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-text-secondary">
                <span>Rent Amount</span>
                <span className="text-primary">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Admin Fee</span>
                <span className="text-primary">{formatCurrency(adminFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-primary">Total</span>
                  <span className="text-accent text-2xl">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-tertiary/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-primary mb-1">Secure Payment</p>
                  <p className="text-xs text-text-secondary">
                    Your payment is processed securely by Midtrans with 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-text-secondary">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:text-accent">
                  terms and conditions
                </a>{' '}
                and payment policy
              </span>
            </label>

            {/* Proceed Button */}
            <button
              onClick={handleProceedPayment}
              disabled={!agreedToTerms || isProcessing}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${
                (!agreedToTerms || isProcessing) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-text-secondary text-center mt-4">
              You will be redirected to Midtrans payment gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
