import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getResidentId, getResidentBookings, getActiveFacilities, createBooking, cancelBooking } from '../../lib/database';
import type { Facility, FacilityBooking } from '../../lib/types/database';
import { Loader2, Calendar, X, AlertCircle, CheckCircle, Plus, Clock } from 'lucide-react';

interface BookingWithFacility extends FacilityBooking {
  facilities: Facility;
}

export function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithFacility[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  // Create booking form state
  const [formData, setFormData] = useState({
    facility_id: '',
    booking_date: '',
    start_time: '',
    duration_hours: 2,
    number_of_guests: 1,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const residentId = await getResidentId(user.id);

      if (!residentId) {
        setError('Resident data not found');
        setLoading(false);
        return;
      }

      // Load bookings
      const { data: bookingsData, error: bookingsError } = await getResidentBookings(residentId);
      if (bookingsError) throw bookingsError;

      // Load facilities
      const { data: facilitiesData, error: facilitiesError } = await getActiveFacilities();
      if (facilitiesError) throw facilitiesError;

      setBookings((bookingsData || []) as BookingWithFacility[]);
      setFacilities(facilitiesData || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const residentId = await getResidentId(user.id);
      if (!residentId) {
        setError('Resident data not found');
        return;
      }

      // Calculate end time
      const [startHour, startMinute] = formData.start_time.split(':').map(Number);
      const endHour = startHour + formData.duration_hours;
      const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;

      // Get facility to calculate fee
      const facility = facilities.find(f => f.id === formData.facility_id);
      if (!facility) {
        setError('Facility not found');
        return;
      }

      const bookingFee = facility.booking_fee * formData.duration_hours;

      const { data, error: createError } = await createBooking({
        resident_id: residentId,
        facility_id: formData.facility_id,
        booking_date: formData.booking_date,
        start_time: `${formData.start_time}:00`,
        end_time: endTime,
        duration_hours: formData.duration_hours,
        number_of_guests: formData.number_of_guests,
        booking_fee: bookingFee,
        notes: formData.notes || undefined,
      });

      if (createError) throw createError;

      setShowCreateModal(false);
      setFormData({
        facility_id: '',
        booking_date: '',
        start_time: '',
        duration_hours: 2,
        number_of_guests: 1,
        notes: '',
      });
      await loadData();
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError('Gagal membuat booking. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;

    try {
      const { error: cancelError } = await cancelBooking(bookingId);
      if (cancelError) throw cancelError;
      await loadData();
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      setError('Gagal membatalkan booking. Silakan coba lagi.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      no_show: 'bg-gray-100 text-gray-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary mb-2">Facility Bookings</h1>
          <p className="text-text-secondary">Manage your facility bookings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

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
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-primary mb-2">No Bookings Found</h2>
          <p className="text-text-secondary mb-6">
            {filterStatus === 'all' 
              ? "You don't have any bookings yet. Create a new booking to get started."
              : `No ${filterStatus} bookings found.`
            }
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Booking
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-primary font-semibold">
                      {(booking as any).facilities?.name || 'Unknown Facility'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-text-secondary">Date</p>
                      <p className="text-primary font-medium">{formatDate(booking.booking_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Time</p>
                      <p className="text-primary font-medium">
                        {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Guests</p>
                      <p className="text-primary font-medium">{booking.number_of_guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Fee</p>
                      <p className="text-primary font-medium">{formatCurrency(booking.booking_fee)}</p>
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-text-secondary">Notes</p>
                      <p className="text-primary">{booking.notes}</p>
                    </div>
                  )}
                </div>
                {booking.status === 'pending' || booking.status === 'confirmed' ? (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="btn-outline text-red-600 border-red-600 hover:bg-red-50 ml-4"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">Create New Booking</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-sm text-primary mb-2">Facility *</label>
                <select
                  value={formData.facility_id}
                  onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Facility</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} - {formatCurrency(facility.booking_fee)}/hour
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Duration (hours) *</label>
                  <input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 1 })}
                    className="input-field"
                    min="1"
                    max="24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Number of Guests *</label>
                  <input
                    type="number"
                    value={formData.number_of_guests}
                    onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) || 1 })}
                    className="input-field"
                    min="1"
                    required
                  />
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
                  onClick={() => setShowCreateModal(false)}
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
                    'Create Booking'
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




