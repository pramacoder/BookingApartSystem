import { Link } from 'react-router-dom';
import {
  CreditCard,
  CalendarDays,
  AlertCircle,
  Bell,
  Home,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { mockPayments, mockBookings, mockAnnouncements, formatCurrency, currentUser } from '../../data/mockData';

export function ResidentDashboard() {
  const pendingPayment = mockPayments.find(p => p.residentId === currentUser.id && p.status === 'pending');
  const upcomingBookings = mockBookings.filter(b => b.residentId === currentUser.id && b.status === 'upcoming');
  const recentAnnouncements = mockAnnouncements.slice(0, 3);
  const openTickets = 1;

  const quickActions = [
    { icon: CreditCard, label: 'Pay Rent', path: '/resident/payment', color: 'bg-accent', textColor: 'text-accent' },
    { icon: CalendarDays, label: 'Book Facility', path: '/resident/bookings/new', color: 'bg-secondary', textColor: 'text-secondary' },
    { icon: MessageSquare, label: 'Submit Complaint', path: '/resident/complaints/new', color: 'bg-info', textColor: 'text-info' },
    { icon: Home, label: 'View My Unit', path: '/resident/unit', color: 'bg-primary', textColor: 'text-primary' }
  ];

  return (
    <div className="space-y-8">
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
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full" />
            </div>
            <div className="text-white">
              <h2 className="text-white mb-1">Welcome back, {currentUser.name}!</h2>
              <p className="text-tertiary">Unit {currentUser.unitNumber} • Resident Dashboard</p>
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
          <h3 className="text-primary mb-2">{openTickets}</h3>
          <p className="text-xs text-text-secondary">Complaints in progress</p>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-error" />
            </div>
            <span className="badge badge-error">{recentAnnouncements.filter(a => !a.isRead).length}</span>
          </div>
          <p className="text-sm text-text-secondary mb-1">Announcements</p>
          <h3 className="text-primary mb-2">{recentAnnouncements.length}</h3>
          <p className="text-xs text-text-secondary">New updates</p>
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
                  <p className="text-primary">{pendingPayment.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary mb-1">Amount</p>
                  <p className="text-accent text-xl">{formatCurrency(pendingPayment.amount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                <Clock className="w-4 h-4" />
                <span>Due Date: {pendingPayment.dueDate}</span>
              </div>

              <p className="text-sm text-text-secondary mb-4">{pendingPayment.description}</p>

              <Link to="/resident/payment" className="btn-primary w-full flex items-center justify-center gap-2">
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
                    <h5 className="text-primary mb-1">{booking.facilityName}</h5>
                    <p className="text-sm text-text-secondary mb-2">
                      {booking.date} • {booking.timeSlot}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{booking.guests} guests</span>
                      {booking.bookingFee > 0 && <span>• {formatCurrency(booking.bookingFee)}</span>}
                    </div>
                  </div>
                  <span className="badge badge-success">Confirmed</span>
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
          {recentAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-start gap-4 p-4 hover:bg-tertiary/10 rounded-xl transition-colors cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${announcement.isRead ? 'bg-gray-300' : 'bg-accent'}`} />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-primary">{announcement.title}</h5>
                  <span className={`badge badge-${announcement.category === 'Important' ? 'error' : announcement.category === 'Maintenance' ? 'warning' : 'info'}`}>
                    {announcement.category}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-2">{announcement.excerpt}</p>
                <p className="text-xs text-text-secondary">{announcement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
