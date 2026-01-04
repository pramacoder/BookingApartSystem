import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockPayments, formatCurrency, currentUser } from '../../data/mockData';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Download, Eye } from 'lucide-react';

export function PaymentCenter() {
  const [activeTab, setActiveTab] = useState<'outstanding' | 'history'>('outstanding');

  const userPayments = mockPayments.filter(p => p.residentId === currentUser.id);
  const outstandingPayments = userPayments.filter(p => p.status !== 'paid');
  const paidPayments = userPayments.filter(p => p.status === 'paid');

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: { class: 'badge-success', icon: CheckCircle, label: 'Paid' },
      pending: { class: 'badge-warning', icon: Clock, label: 'Pending' },
      overdue: { class: 'badge-error', icon: AlertCircle, label: 'Overdue' }
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`badge ${badge.class} flex items-center gap-1`}>
        <badge.icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const totalOutstanding = outstandingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaidThisYear = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-primary mb-2">Payment Center</h2>
        <p className="text-text-secondary">Kelola pembayaran sewa dan tagihan Anda</p>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <span className="badge badge-error">{outstandingPayments.length}</span>
          </div>
          <p className="text-sm text-text-secondary mb-1">Outstanding Bills</p>
          <h3 className="text-error">{formatCurrency(totalOutstanding)}</h3>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Paid This Year</p>
          <h3 className="text-success">{formatCurrency(totalPaidThisYear)}</h3>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-info" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Average Monthly</p>
          <h3 className="text-info">
            {formatCurrency(paidPayments.length > 0 ? totalPaidThisYear / paidPayments.length : 0)}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('outstanding')}
              className={`px-6 py-4 transition-colors relative ${
                activeTab === 'outstanding'
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Outstanding Bills
              {outstandingPayments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-error text-white rounded-full text-xs">
                  {outstandingPayments.length}
                </span>
              )}
              {activeTab === 'outstanding' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 transition-colors relative ${
                activeTab === 'history'
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Payment History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'outstanding' ? (
            <div>
              {outstandingPayments.length > 0 ? (
                <div className="space-y-4">
                  {outstandingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="card bg-gradient-to-r from-white to-gray-50 p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-primary mb-1">{payment.invoiceNumber}</h4>
                              <p className="text-text-secondary text-sm">{payment.description}</p>
                            </div>
                            {getStatusBadge(payment.status)}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {payment.dueDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span>Unit: {payment.unitNumber}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-l lg:pl-6">
                          <div className="text-left sm:text-right">
                            <p className="text-sm text-text-secondary mb-1">Amount Due</p>
                            <p className="text-accent text-2xl">{formatCurrency(payment.amount)}</p>
                          </div>
                          <Link
                            to={`/resident/payment/${payment.id}`}
                            className="btn-primary whitespace-nowrap"
                          >
                            Pay Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h4 className="text-primary mb-2">All Caught Up!</h4>
                  <p className="text-text-secondary">You have no outstanding payments</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {paidPayments.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-text-secondary">
                      Showing {paidPayments.length} completed payments
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                      Export to PDF
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm text-text-secondary">Invoice</th>
                          <th className="text-left py-3 px-4 text-sm text-text-secondary">Description</th>
                          <th className="text-left py-3 px-4 text-sm text-text-secondary">Payment Date</th>
                          <th className="text-left py-3 px-4 text-sm text-text-secondary">Method</th>
                          <th className="text-right py-3 px-4 text-sm text-text-secondary">Amount</th>
                          <th className="text-center py-3 px-4 text-sm text-text-secondary">Status</th>
                          <th className="text-center py-3 px-4 text-sm text-text-secondary">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidPayments.map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <p className="text-primary">{payment.invoiceNumber}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-text-secondary text-sm">{payment.description}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-text-secondary text-sm">{payment.paymentDate}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-text-secondary text-sm">{payment.paymentMethod}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-primary">{formatCurrency(payment.amount)}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {getStatusBadge(payment.status)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-text-secondary" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                  <h4 className="text-primary mb-2">No Payment History</h4>
                  <p className="text-text-secondary">Your payment history will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card p-6">
        <h3 className="text-primary mb-4">Saved Payment Methods</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border-2 border-primary/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-primary">•••• •••• •••• 1234</p>
                <p className="text-sm text-text-secondary">Expires 12/25</p>
              </div>
            </div>
            <span className="badge badge-success">Default</span>
          </div>

          <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-colors">
            + Add New Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}
