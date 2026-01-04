import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockPayments, formatCurrency, currentUser } from '../../data/mockData';
import { CreditCard, Building2, Calendar, Tag, Shield, ArrowRight, Check } from 'lucide-react';

export function MakePayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'bank' | 'ewallet'>('credit');
  const [promoCode, setPromoCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const payment = mockPayments.find(p => p.id === id);

  if (!payment) {
    return (
      <div className="card p-12 text-center">
        <p className="text-text-secondary mb-4">Payment not found</p>
        <button onClick={() => navigate('/resident/payment')} className="btn-primary">
          Back to Payment Center
        </button>
      </div>
    );
  }

  const adminFee = 2500;
  const discount = 0;
  const total = payment.amount + adminFee - discount;

  const handleProceedPayment = () => {
    if (!agreedToTerms) {
      alert('Please agree to terms and conditions');
      return;
    }

    setIsProcessing(true);

    // Simulate redirect to Midtrans
    setTimeout(() => {
      // Randomly simulate success, failed, or pending
      const outcomes = ['success', 'failed', 'pending'];
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      navigate(`/payment/${randomOutcome}?order_id=${payment.invoiceNumber}`);
    }, 2000);
  };

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
