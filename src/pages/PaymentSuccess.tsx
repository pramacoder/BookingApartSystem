import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Home, FileText, ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../data/mockData';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Add success animation or confetti here
  }, []);

  const transactionDetails = {
    invoiceNumber: orderId || 'INV-2025-01-001',
    paymentDate: '11/12/2024 14:35',
    amount: 8502500,
    paymentMethod: 'Credit Card (**** 1234)',
    transactionId: 'TRX-' + Date.now()
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation Card */}
        <div className="card p-12 text-center mb-6">
          {/* Animated Success Icon */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
            <div className="relative w-32 h-32 bg-success rounded-full flex items-center justify-center">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
          </div>

          <h1 className="text-success mb-3">Payment Successful!</h1>
          <p className="text-text-secondary text-lg mb-8">
            Your payment has been processed successfully. Thank you for your payment.
          </p>

          {/* Transaction Summary */}
          <div className="bg-gradient-to-br from-tertiary/10 to-tertiary/5 rounded-2xl p-8 mb-8 text-left">
            <h3 className="text-primary mb-6 text-center">Transaction Summary</h3>
            
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
                <span className="text-text-secondary">Payment Date</span>
                <span className="text-primary">{transactionDetails.paymentDate}</span>
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

          {/* What's Next Section */}
          <div className="bg-info/10 rounded-xl p-6 mb-8 text-left">
            <h4 className="text-primary mb-3">What's Next?</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Payment confirmation email has been sent to your registered email</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Your receipt can be downloaded below</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Payment will be confirmed within 1-2 business days</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-outline flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Receipt
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/resident/dashboard"
            className="card p-6 hover:shadow-xl transition-all text-center group"
          >
            <Home className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-primary">Back to Dashboard</p>
          </Link>
          
          <Link
            to="/resident/bookings/new"
            className="card p-6 hover:shadow-xl transition-all text-center group"
          >
            <ArrowRight className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-primary">Book a Facility</p>
          </Link>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-text-secondary text-sm mb-2">
            Need help with your payment?
          </p>
          <Link to="/contact" className="text-primary hover:text-accent transition-colors text-sm">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
