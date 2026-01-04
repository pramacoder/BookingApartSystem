import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle, AlertTriangle } from 'lucide-react';

export function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const errorDetails = {
    invoiceNumber: orderId || 'INV-2025-01-001',
    transactionId: 'TRX-' + Date.now(),
    attemptTime: '11/12/2024 14:35',
    reason: 'Insufficient balance or payment declined by bank'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="card p-12 text-center mb-6">
          {/* Error Icon */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="relative w-32 h-32 bg-error rounded-full flex items-center justify-center">
              <XCircle className="w-20 h-20 text-white" />
            </div>
          </div>

          <h1 className="text-error mb-3">Payment Failed</h1>
          <p className="text-text-secondary text-lg mb-8">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>

          {/* Error Details */}
          <div className="bg-error/5 border-2 border-error/20 rounded-2xl p-8 mb-8 text-left">
            <div className="flex items-start gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-error mb-2">Transaction Details</h4>
                <p className="text-text-secondary text-sm">{errorDetails.reason}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Invoice Number</span>
                <span className="text-primary">{errorDetails.invoiceNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Transaction ID</span>
                <span className="text-primary font-mono text-xs">{errorDetails.transactionId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Attempt Time</span>
                <span className="text-primary">{errorDetails.attemptTime}</span>
              </div>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-warning/10 border-2 border-warning/20 rounded-xl p-6 mb-8 text-left">
            <h4 className="text-primary mb-3">Common Reasons for Payment Failure:</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Insufficient balance in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Payment declined by your bank or card issuer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Incorrect card details or expired card</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Network connection issues during transaction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Daily transaction limit exceeded</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <Link
              to="/resident/payment"
              className="btn-outline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Choose Another Method
            </Link>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </Link>
        </div>

        {/* Support Information */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-info" />
            </div>
            <div>
              <h4 className="text-primary mb-2">Need Help?</h4>
              <p className="text-text-secondary text-sm mb-4">
                If you continue to experience issues, please contact our support team for assistance.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-text-secondary">
                  <span className="text-primary">Email:</span> support@greenview.com
                </p>
                <p className="text-text-secondary">
                  <span className="text-primary">Phone:</span> +62 21 1234 5678
                </p>
                <p className="text-text-secondary">
                  <span className="text-primary">Working Hours:</span> Mon-Fri 08:00-17:00
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link
            to="/resident/dashboard"
            className="text-primary hover:text-accent transition-colors text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
