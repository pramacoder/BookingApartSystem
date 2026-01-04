import { Link, useSearchParams } from 'react-router-dom';
import { Clock, RefreshCw, Home, FileText, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../data/mockData';

export function PaymentPending() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Here you would check payment status
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh]);

  const transactionDetails = {
    invoiceNumber: orderId || 'INV-2025-01-001',
    submittedDate: '11/12/2024 14:35',
    amount: 8502500,
    paymentMethod: 'Bank Transfer (BCA)',
    transactionId: 'TRX-' + Date.now(),
    estimatedTime: '1-2 business days'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Pending Card */}
        <div className="card p-12 text-center mb-6">
          {/* Animated Pending Icon */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-warning/20 rounded-full animate-pulse" />
            <div className="relative w-32 h-32 bg-warning rounded-full flex items-center justify-center">
              <Clock className="w-20 h-20 text-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-warning mb-3">Payment Processing</h1>
          <p className="text-text-secondary text-lg mb-8">
            Your payment is being processed. This usually takes a few moments to complete.
          </p>

          {/* Auto Refresh Status */}
          {autoRefresh && (
            <div className="bg-info/10 border-2 border-info/20 rounded-xl p-4 mb-8 inline-flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-info animate-spin" />
              <span className="text-info text-sm">
                Auto-checking status in {countdown} seconds...
              </span>
              <button
                onClick={() => setAutoRefresh(false)}
                className="text-info hover:text-info/70 text-sm underline"
              >
                Stop
              </button>
            </div>
          )}

          {/* Transaction Summary */}
          <div className="bg-gradient-to-br from-tertiary/10 to-tertiary/5 rounded-2xl p-8 mb-8 text-left">
            <h3 className="text-primary mb-6 text-center">Transaction Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                <span className="text-text-secondary">Invoice Number</span>
                <span className="text-primary">{transactionDetails.invoiceNumber}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                <span className="text-text-secondary">Transaction ID</span>
                <span className="text-primary font-mono text-sm">{transactionDetails.transactionId}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                <span className="text-text-secondary">Submitted Date</span>
                <span className="text-primary">{transactionDetails.submittedDate}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                <span className="text-text-secondary">Payment Method</span>
                <span className="text-primary">{transactionDetails.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-primary">Total Amount</span>
                <span className="text-accent text-2xl">{formatCurrency(transactionDetails.amount)}</span>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-warning/10 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-primary mb-2">What happens next?</h4>
                <p className="text-text-secondary text-sm mb-4">
                  We're verifying your payment with the bank. This process may take some time depending on your payment method.
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-text-secondary text-sm pl-8">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Estimated processing time: <span className="text-primary">{transactionDetails.estimatedTime}</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>You will receive an email confirmation once payment is verified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>You can check payment status in your payment history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Please keep your transaction ID for reference</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setAutoRefresh(true);
                setCountdown(30);
              }}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check Status Now
            </button>
            
            <Link
              to="/resident/payment/history"
              className="btn-outline flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Payment History
            </Link>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            to="/resident/dashboard"
            className="card p-6 hover:shadow-xl transition-all text-center group"
          >
            <Home className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-primary">Back to Dashboard</p>
          </Link>
          
          <Link
            to="/contact"
            className="card p-6 hover:shadow-xl transition-all text-center group"
          >
            <Info className="w-8 h-8 text-info mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-primary">Contact Support</p>
          </Link>
        </div>

        {/* Important Note */}
        <div className="card p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <h4 className="text-primary mb-3">Important Notice</h4>
          <p className="text-text-secondary text-sm">
            If your payment status doesn't update within the estimated time, please contact our support team with your transaction ID. 
            Do not make another payment for the same invoice to avoid double charges.
          </p>
        </div>
      </div>
    </div>
  );
}
