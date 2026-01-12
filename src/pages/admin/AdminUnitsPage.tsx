import { useEffect, useState } from 'react';
import { getAllUnits, createUnit, updateUnit, deleteUnit } from '../../lib/database';
import type { Unit } from '../../lib/types/database';
import { Loader2, Plus, Edit, Trash2, Search, Filter, X, AlertCircle, CheckCircle, Home } from 'lucide-react';

export function AdminUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    floor: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    unit_number: '',
    unit_type: 'studio',
    floor: 1,
    size_sqm: 0,
    bedrooms: 0,
    bathrooms: 1,
    orientation: '',
    monthly_rent: 0,
    yearly_booking_price: 0,
    deposit_required: 0,
    status: 'available',
    features: [] as string[],
    floor_plan_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUnits();
  }, [filters, searchTerm]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await getAllUnits({
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        floor: filters.floor ? parseInt(filters.floor) : undefined,
        search: searchTerm || undefined,
      });

      if (fetchError) throw fetchError;
      setUnits(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading units:', err);
      setError('Gagal memuat data units.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const { data, error: createError } = await createUnit({
        ...formData,
        features: formData.features.length > 0 ? formData.features : [],
        orientation: formData.orientation || undefined,
        yearly_booking_price: formData.yearly_booking_price || undefined,
        floor_plan_url: formData.floor_plan_url || undefined,
      });

      if (createError) throw createError;

      setShowCreateModal(false);
      resetForm();
      setSuccess('Unit berhasil dibuat!');
      setTimeout(() => setSuccess(null), 3000);
      await loadUnits();
    } catch (err: any) {
      console.error('Error creating unit:', err);
      setError('Gagal membuat unit. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    try {
      setSubmitting(true);
      setError(null);

      const { data, error: updateError } = await updateUnit(editingUnit.id, {
        ...formData,
        features: formData.features.length > 0 ? formData.features : [],
        orientation: formData.orientation || undefined,
        yearly_booking_price: formData.yearly_booking_price || undefined,
        floor_plan_url: formData.floor_plan_url || undefined,
      });

      if (updateError) throw updateError;

      setShowEditModal(false);
      setEditingUnit(null);
      resetForm();
      setSuccess('Unit berhasil diupdate!');
      setTimeout(() => setSuccess(null), 3000);
      await loadUnits();
    } catch (err: any) {
      console.error('Error updating unit:', err);
      setError('Gagal mengupdate unit. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus unit ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const { error: deleteError } = await deleteUnit(unitId);
      if (deleteError) throw deleteError;

      setSuccess('Unit berhasil dihapus!');
      setTimeout(() => setSuccess(null), 3000);
      await loadUnits();
    } catch (err: any) {
      console.error('Error deleting unit:', err);
      setError('Gagal menghapus unit. Silakan coba lagi.');
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      unit_number: unit.unit_number,
      unit_type: unit.unit_type,
      floor: unit.floor,
      size_sqm: unit.size_sqm,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      orientation: unit.orientation || '',
      monthly_rent: unit.monthly_rent,
      yearly_booking_price: unit.yearly_booking_price || 0,
      deposit_required: unit.deposit_required,
      status: unit.status,
      features: Array.isArray(unit.features) ? unit.features : [],
      floor_plan_url: unit.floor_plan_url || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      unit_number: '',
      unit_type: 'studio',
      floor: 1,
      size_sqm: 0,
      bedrooms: 0,
      bathrooms: 1,
      orientation: '',
      monthly_rent: 0,
      yearly_booking_price: 0,
      deposit_required: 0,
      status: 'available',
      features: [],
      floor_plan_url: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      occupied: 'bg-blue-100 text-blue-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      reserved: 'bg-purple-100 text-purple-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary mb-2">Unit Management</h1>
          <p className="text-text-secondary">Manage all apartment units</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Unit
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
                placeholder="Search unit number..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-primary mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="studio">Studio</option>
              <option value="1br">1BR</option>
              <option value="2br">2BR</option>
              <option value="3br">3BR</option>
              <option value="4br">4BR</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-primary mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-primary mb-2">Floor</label>
            <input
              type="number"
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="input-field"
              placeholder="Filter by floor..."
            />
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Unit Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Monthly Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {units.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-secondary">No units found</p>
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary font-medium">{unit.unit_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary">{unit.unit_type.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary">Floor {unit.floor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary">{unit.size_sqm} m²</div>
                      <div className="text-sm text-text-secondary">{unit.bedrooms}BR / {unit.bathrooms}BA</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-primary font-medium">{formatCurrency(unit.monthly_rent)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(unit.status)}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="text-primary hover:text-accent transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">
                {showEditModal ? 'Edit Unit' : 'Create New Unit'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingUnit(null);
                  resetForm();
                }}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={showEditModal ? handleUpdateUnit : handleCreateUnit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Unit Number *</label>
                  <input
                    type="text"
                    value={formData.unit_number}
                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                    className="input-field"
                    placeholder="A-101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Type *</label>
                  <select
                    value={formData.unit_type}
                    onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="studio">Studio</option>
                    <option value="1br">1BR</option>
                    <option value="2br">2BR</option>
                    <option value="3br">3BR</option>
                    <option value="4br">4BR</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Floor *</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Size (m²) *</label>
                  <input
                    type="number"
                    value={formData.size_sqm}
                    onChange={(e) => setFormData({ ...formData, size_sqm: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Orientation</label>
                  <select
                    value={formData.orientation}
                    onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                    <option value="northeast">Northeast</option>
                    <option value="northwest">Northwest</option>
                    <option value="southeast">Southeast</option>
                    <option value="southwest">Southwest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Bedrooms *</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Bathrooms *</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Monthly Rent *</label>
                  <input
                    type="number"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData({ ...formData, monthly_rent: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Yearly Booking Price</label>
                  <input
                    type="number"
                    value={formData.yearly_booking_price}
                    onChange={(e) => setFormData({ ...formData, yearly_booking_price: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Deposit Required *</label>
                  <input
                    type="number"
                    value={formData.deposit_required}
                    onChange={(e) => setFormData({ ...formData, deposit_required: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Floor Plan URL</label>
                <input
                  type="url"
                  value={formData.floor_plan_url}
                  onChange={(e) => setFormData({ ...formData, floor_plan_url: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingUnit(null);
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
                      {showEditModal ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    showEditModal ? 'Update Unit' : 'Create Unit'
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




