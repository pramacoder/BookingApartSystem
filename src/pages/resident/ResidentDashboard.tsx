import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  CreditCard,
  CalendarDays,
  AlertCircle,
  Bell,
  Home,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Clock,
  Key,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';
import { getResidentWithUnit, getResidentBookings, getAllPayments, getAllAnnouncements, markKeyAsCollected } from '../../lib/database';
import { getUserNotifications } from '../../lib/firestore';
import type { Resident, Unit, FacilityBooking, Payment, Announcement } from '../../lib/types/database';

export function ResidentDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<FacilityBooking[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [showKeyNotification, setShowKeyNotification] = useState(false);
  const [markingKeyCollected, setMarkingKeyCollected] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Load resident data with unit
      const { data: residentData, error: residentError } = await getResidentWithUnit(user.id);
      if (residentError) throw residentError;
      
      if (residentData) {
        setResident(residentData.resident);
        setUnit(residentData.unit || null);
        
        // Check if key needs to be collected
        if (residentData.resident.unit_id && !residentData.resident.key_collected_at) {
          setShowKeyNotification(true);
        }
      }

      // Load pending payments
      const { data: paymentsData, error: paymentsError } = await getAllPayments({ 
        status: 'pending',
        search: user.id 
      });
      if (paymentsError) console.error('Error loading payments:', paymentsError);
      setPendingPayments(paymentsData?.slice(0, 5) || []);

      // Load upcoming facility bookings
      if (residentData?.resident?.id) {
        const { data: bookingsData, error: bookingsError } = await getResidentBookings(residentData.resident.id);
        if (bookingsError) console.error('Error loading bookings:', bookingsError);
        const upcoming = bookingsData?.filter(b => 
          b.status === 'confirmed' || b.status === 'pending'
        ).slice(0, 3) || [];
        setUpcomingBookings(upcoming);
      }

      // Set resident state
      if (residentData?.resident) {
        setResident(residentData.resident);
      }

      // Load recent announcements
      const { data: announcementsData, error: announcementsError } = await getAllAnnouncements({ 
        status: 'published' 
      });
      if (announcementsError) console.error('Error loading announcements:', announcementsError);
      setRecentAnnouncements(announcementsData?.slice(0, 3) || []);

      // TODO: Load open tickets count
      // const { data: ticketsData } = await getResidentTickets(residentData?.resident.id);
      // setOpenTicketsCount(ticketsData?.filter(t => t.status !== 'resolved' && t.status !== 'closed').length || 0);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Gagal memuat data dashboard. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkKeyCollected = async () => {
    if (!resident || !user) return;

    setMarkingKeyCollected(true);
    try {
      const { error: keyError } = await markKeyAsCollected(resident.id);
      if (keyError) throw keyError;
      
      setShowKeyNotification(false);
      if (resident) {
        setResident({ ...resident, key_collected_at: new Date().toISOString() });
      }
    } catch (err: any) {
      console.error('Error marking key as collected:', err);
      setError('Gagal menandai kunci sebagai sudah diambil. Silakan coba lagi.');
    } finally {
      setMarkingKeyCollected(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingPayment = pendingPayments[0];
  const userName = profile?.full_name || user?.email || 'Resident';
  const unitNumber = unit?.unit_number || (resident?.unit_id ? 'Pending' : 'Not Assigned');

  const quickActions = [
    { icon: CreditCard, label: 'Pay Rent', path: '/resident/payment', color: 'bg-accent', textColor: 'text-accent' },
    { icon: CalendarDays, label: 'Book Facility', path: '/resident/bookings/new', color: 'bg-secondary', textColor: 'text-secondary' },
    { icon: MessageSquare, label: 'Chat Admin', path: '/resident/chat', color: 'bg-info', textColor: 'text-info' },
    { icon: Home, label: 'View My Unit', path: '/resident/unit', color: 'bg-primary', textColor: 'text-primary' }
  ];

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Key Pickup Notification */}
      {showKeyNotification && (
        <div className="card p-6 bg-accent/10 border-2 border-accent">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-primary font-semibold mb-2">Kunci Unit Siap Diambil</h3>
              <p className="text-text-secondary mb-4">
                Unit {unit?.unit_number || ''} telah ditetapkan untuk Anda. Silakan ambil kunci unit di kantor administrasi.
              </p>
              <button
                onClick={handleMarkKeyCollected}
                disabled={markingKeyCollected}
                className="btn-primary inline-flex items-center gap-2"
              >
                {markingKeyCollected ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Tandai Sebagai Sudah Diambil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card overflow-hidden">
        <div
          className="relative h-48 flex items-center px-8"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjUzODI3NjN8MA&ixlib=rb-4.1.0&q=80&w=1080)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Home className="w-10 h-10 text-primary" />
            </div>
            <div className="text-white">
              <h2 className="text-white mb-1">Welcome back, {userName}!</h2>
              <p className="text-tertiary">
                {unit ? `Unit ${unit.unit_number}` : 'Belum ada unit yang ditetapkan'} • Resident Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-accent" />
            </div>
            {pendingPayment && <span className="badge badge-warning">Pending</span>}
          </div>
          <p className="text-sm text-text-secondary mb-1">Current Bill</p>
          <h3 className="text-accent mb-2">
            {pendingPayment ? formatCurrency(pendingPayment.amount) : 'Rp 0'}
          </h3>
          {pendingPayment && (
            <p className="text-xs text-text-secondary">Due: {pendingPayment.dueDate}</p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Active Bookings</p>
          <h3 className="text-primary mb-2">{upcomingBookings.length}</h3>
          <p className="text-xs text-text-secondary">Upcoming facilities</p>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-info" />
            </div>
            {openTickets > 0 && <span className="badge badge-info">{openTickets}</span>}
          </div>
          <p className="text-sm text-text-secondary mb-1">Open Tickets</p>
          <h3 className="text-primary mb-2">{openTicketsCount}</h3>
          <p className="text-xs text-text-secondary">Complaints in progress</p>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-error" />
            </div>
            <span className="badge badge-error">{recentAnnouncements.length}</span>
          </div>
          <p className="text-sm text-text-secondary mb-1">Announcements</p>
          <h3 className="text-primary mb-2">{recentAnnouncements.length}</h3>
          <p className="text-xs text-text-secondary">Recent updates</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="card p-6 hover:shadow-xl transition-all text-center group"
            >
              <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-8 h-8 text-white" />
              </div>
              <p className={`${action.textColor}`}>{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Payment */}
        {pendingPayment && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-primary">Upcoming Payment</h3>
              <span className="badge badge-warning">Action Required</span>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Invoice</p>
                  <p className="text-primary">{pendingPayment.invoice_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary mb-1">Amount</p>
                  <p className="text-accent text-xl">{formatCurrency(pendingPayment.total_amount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                <Clock className="w-4 h-4" />
                <span>Due Date: {new Date(pendingPayment.due_date).toLocaleDateString('id-ID')}</span>
              </div>

              <p className="text-sm text-text-secondary mb-4 capitalize">
                {pendingPayment.payment_type.replace('_', ' ')}
              </p>

              <Link to={`/resident/payment/${pendingPayment.id}`} className="btn-primary w-full flex items-center justify-center gap-2">
                Pay Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/resident/payment/history" className="text-primary hover:text-accent transition-colors text-sm flex items-center gap-2">
              View Payment History
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Upcoming Bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-primary">Upcoming Bookings</h3>
            <Link to="/resident/bookings" className="text-sm text-secondary hover:text-accent transition-colors">
              View All
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-start gap-4 p-4 bg-tertiary/10 rounded-xl">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-primary mb-1">Facility Booking</h5>
                    <p className="text-sm text-text-secondary mb-2">
                      {new Date(booking.booking_date).toLocaleDateString('id-ID')} • {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{booking.number_of_guests} guests</span>
                      {booking.booking_fee > 0 && <span>• {formatCurrency(booking.booking_fee)}</span>}
                    </div>
                  </div>
                  <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : 'warning'}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
              
              <Link
                to="/resident/bookings/new"
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                Book Another Facility
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No upcoming bookings</p>
              <Link to="/resident/bookings/new" className="btn-primary inline-flex items-center gap-2">
                Book a Facility
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary">Recent Announcements</h3>
          <Link to="/resident/announcements" className="text-sm text-secondary hover:text-accent transition-colors">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map((announcement) => (
              <Link
                key={announcement.id}
                to={`/resident/announcements#${announcement.id}`}
                className="flex items-start gap-4 p-4 hover:bg-tertiary/10 rounded-xl transition-colors cursor-pointer block"
              >
                <div className="w-2 h-2 rounded-full mt-2 bg-accent" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-primary">{announcement.title}</h5>
                    <span className={`badge badge-${announcement.category === 'important' ? 'error' : announcement.category === 'maintenance' ? 'warning' : 'info'}`}>
                      {announcement.category}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                    {announcement.content.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(announcement.publish_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center py-8 text-text-secondary">Tidak ada pengumuman terbaru</p>
          )}
        </div>
      </div>
    </div>
  );
}
