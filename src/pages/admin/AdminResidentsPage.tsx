import { useEffect, useState } from 'react';
import { getAllResidents, getAllUnits } from '../../lib/database';
import { signUp } from '../../lib/auth';
import type { Resident, Unit } from '../../lib/types/database';
import { Loader2, Plus, Edit, Search, X, AlertCircle, CheckCircle, Users, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ResidentWithDetails extends Resident {
  users?: {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
  };
  units?: {
    id: string;
    unit_number: string;
  };
}

export function AdminResidentsPage() {
  const [residents, setResidents] = useState<ResidentWithDetails[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Create resident form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    unit_id: '',
    contract_start: '',
    contract_end: '',
    deposit_amount: 0,
    move_in_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterStatus, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load residents
      const { data: residentsData, error: residentsError } = await getAllResidents({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      });
      if (residentsError) throw residentsError;

      // Load units for dropdown
      const { data: unitsData, error: unitsError } = await getAllUnits();
      if (unitsError) throw unitsError;

      setResidents((residentsData || []) as ResidentWithDetails[]);
      setUnits(unitsData || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Gagal memuat data residents.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      // Create user account first
      const { data: authData, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.full_name,
          phone: formData.phone,
        }
      );

      if (authError) throw authError;
      if (!authData?.user) {
        throw new Error('Failed to create user account');
      }

      // Wait a bit for user record to sync
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get resident_id from user_id
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('id')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (residentError && residentError.code !== 'PGRST116') {
        throw residentError;
      }

      // If resident record doesn't exist, create it
      if (!residentData) {
        const { error: createResidentError } = await supabase
          .from('residents')
          .insert({
            user_id: authData.user.id,
            unit_id: formData.unit_id || undefined,
            contract_start: formData.contract_start || undefined,
            contract_end: formData.contract_end || undefined,
            deposit_amount: formData.deposit_amount || 0,
            move_in_date: formData.move_in_date || undefined,
            emergency_contact_name: formData.emergency_contact_name || undefined,
            emergency_contact_phone: formData.emergency_contact_phone || undefined,
            status: 'active',
          });

        if (createResidentError) throw createResidentError;
      } else {
        // Update existing resident record
        const { error: updateResidentError } = await supabase
          .from('residents')
          .update({
            unit_id: formData.unit_id || undefined,
            contract_start: formData.contract_start || undefined,
            contract_end: formData.contract_end || undefined,
            deposit_amount: formData.deposit_amount || 0,
            move_in_date: formData.move_in_date || undefined,
            emergency_contact_name: formData.emergency_contact_name || undefined,
            emergency_contact_phone: formData.emergency_contact_phone || undefined,
            status: 'active',
          })
          .eq('id', residentData.id);

        if (updateResidentError) throw updateResidentError;
      }

      setShowCreateModal(false);
      resetForm();
      setSuccess('Resident berhasil dibuat!');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err: any) {
      console.error('Error creating resident:', err);
      setError(err.message || 'Gagal membuat resident. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      unit_id: '',
      contract_start: '',
      contract_end: '',
      deposit_amount: 0,
      move_in_date: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
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
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      terminated: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data residents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary mb-2">Residents Management</h1>
          <p className="text-text-secondary">Manage resident information and contracts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Resident
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-primary mb-2">Search</label>
            <div className="relative">
              <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by name, email, phone..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-primary mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Residents Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Contract</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {residents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-secondary">No residents found</p>
                  </td>
                </tr>
              ) : (
                residents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary font-medium">
                        {resident.users?.full_name || resident.users?.email || 'N/A'}
                      </div>
                      {resident.users?.phone && (
                        <div className="text-sm text-text-secondary">{resident.users.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary">{resident.users?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary">
                        {resident.units?.unit_number || 'Not assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">
                        {formatDate(resident.contract_start)} - {formatDate(resident.contract_end)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(resident.status)}`}>
                        {resident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {/* Create Resident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">Create New Resident</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResident} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Assign Unit</label>
                <select
                  value={formData.unit_id}
                  onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Unit (Optional)</option>
                  {units.filter(u => u.status === 'available').map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_number} - {unit.unit_type.toUpperCase()} (Floor {unit.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Contract Start</label>
                  <input
                    type="date"
                    value={formData.contract_start}
                    onChange={(e) => setFormData({ ...formData, contract_start: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Contract End</label>
                  <input
                    type="date"
                    value={formData.contract_end}
                    onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Move-in Date</label>
                  <input
                    type="date"
                    value={formData.move_in_date}
                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Deposit Amount</label>
                  <input
                    type="number"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
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
                      Creating...
                    </div>
                  ) : (
                    'Create Resident'
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




