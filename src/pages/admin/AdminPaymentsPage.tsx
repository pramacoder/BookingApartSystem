import { useEffect, useState } from 'react';
import { getAllPayments, getAllResidents, createPayment, updatePaymentStatus } from '../../lib/database';
import type { Payment } from '../../lib/types/database';
import { Loader2, Plus, Edit, Search, X, AlertCircle, CheckCircle, CreditCard, Filter, Calendar } from 'lucide-react';

interface PaymentWithDetails extends Payment {
  residents?: {
    id: string;
    users?: {
      email: string;
      full_name?: string;
    };
  };
  units?: {
    id: string;
    unit_number: string;
  };
}

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    date_from: '',
    date_to: '',
  });

  // Generate invoice form state
  const [formData, setFormData] = useState({
    resident_id: '',
    unit_id: '',
    payment_type: 'rent',
    amount: 0,
    admin_fee: 0,
    discount: 0,
    penalty: 0,
    due_date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load payments
      const { data: paymentsData, error: paymentsError } = await getAllPayments({
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        search: searchTerm || undefined,
      });
      if (paymentsError) throw paymentsError;

      // Load residents for dropdown
      const { data: residentsData, error: residentsError } = await getAllResidents();
      if (residentsError) throw residentsError;

      setPayments((paymentsData || []) as PaymentWithDetails[]);
      setResidents((residentsData || []) as any[]);
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Gagal memuat data payments.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const { data, error: createError } = await createPayment({
        resident_id: formData.resident_id,
        unit_id: formData.unit_id,
        payment_type: formData.payment_type,
        amount: formData.amount,
        admin_fee: formData.admin_fee,
        discount: formData.discount,
        penalty: formData.penalty,
        due_date: formData.due_date,
        notes: formData.notes || undefined,
      });

      if (createError) throw createError;

      setShowGenerateModal(false);
      resetForm();
      setSuccess('Invoice berhasil dibuat!');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError('Gagal membuat invoice. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      const paymentDate = newStatus === 'paid' ? new Date().toISOString() : undefined;
      const { error: updateError } = await updatePaymentStatus(paymentId, newStatus, paymentDate);
      if (updateError) throw updateError;

      setSuccess('Payment status berhasil diupdate!');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      setError('Gagal mengupdate status payment. Silakan coba lagi.');
    }
  };

  const resetForm = () => {
    setFormData({
      resident_id: '',
      unit_id: '',
      payment_type: 'rent',
      amount: 0,
      admin_fee: 0,
      discount: 0,
      penalty: 0,
      due_date: '',
      notes: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      refunded: 'bg-blue-100 text-blue-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary mb-2">Payment Management</h1>
          <p className="text-text-secondary">Monitor payments and generate invoices</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowGenerateModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="card p-4 bg-green-50 border border-green-200 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-primary mb-2">Search</label>
            <div className="relative">
              <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search invoice, name..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-primary mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-primary mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="rent">Rent</option>
              <option value="utilities">Utilities</option>
              <option value="maintenance">Maintenance</option>
              <option value="deposit">Deposit</option>
              <option value="penalty">Penalty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-primary mb-2">Due Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-secondary">No payments found</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={`hover:bg-gray-50 ${
                      isOverdue(payment.due_date, payment.status) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary font-medium">{payment.invoice_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary">
                        {payment.residents?.users?.full_name || payment.residents?.users?.email || 'N/A'}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {payment.units?.unit_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary capitalize">{payment.payment_type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary font-medium">{formatCurrency(payment.total_amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-primary ${isOverdue(payment.due_date, payment.status) ? 'text-red-600 font-semibold' : ''}`}>
                        {formatDate(payment.due_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(payment.id, 'paid')}
                          className="text-green-600 hover:text-green-800 transition-colors mr-3"
                          title="Mark as Paid"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        className="text-primary hover:text-accent transition-colors"
                        title="View Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">Generate Invoice</h2>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  resetForm();
                }}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm text-primary mb-2">Resident *</label>
                <select
                  value={formData.resident_id}
                  onChange={(e) => {
                    const selectedResident = residents.find(r => r.id === e.target.value);
                    setFormData({
                      ...formData,
                      resident_id: e.target.value,
                      unit_id: selectedResident?.unit_id || '',
                    });
                  }}
                  className="input-field"
                  required
                >
                  <option value="">Select Resident</option>
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.users?.full_name || resident.users?.email} - {resident.units?.unit_number || 'No unit'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Unit *</label>
                <input
                  type="text"
                  value={formData.unit_id}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="input-field bg-gray-50"
                  placeholder="Auto-filled from resident"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Payment Type *</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="deposit">Deposit</option>
                    <option value="penalty">Penalty</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Amount *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Admin Fee</label>
                  <input
                    type="number"
                    value={formData.admin_fee}
                    onChange={(e) => setFormData({ ...formData, admin_fee: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Discount</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Penalty</label>
                  <input
                    type="number"
                    value={formData.penalty}
                    onChange={(e) => setFormData({ ...formData, penalty: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Total Amount</label>
                <div className="input-field bg-gray-50 font-semibold">
                  {formatCurrency(
                    formData.amount + formData.admin_fee - formData.discount + formData.penalty
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false);
                    resetForm();
                  }}
                  className="btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    'Generate Invoice'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




