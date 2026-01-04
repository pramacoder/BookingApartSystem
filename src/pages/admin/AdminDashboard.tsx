import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { mockUnits, mockResidents, mockPayments, mockTickets, formatCurrency } from '../../data/mockData';

export function AdminDashboard() {
  const totalUnits = mockUnits.length;
  const occupiedUnits = mockUnits.filter(u => u.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  
  const totalRevenue = mockPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = mockPayments.filter(p => p.status === 'pending').length;
  const overduePayments = mockPayments.filter(p => p.status === 'overdue').length;
  
  const openTickets = mockTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  const recentPayments = mockPayments.slice(0, 5);
  const recentTickets = mockTickets.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-primary mb-2">Admin Dashboard</h2>
        <p className="text-text-secondary">Overview of apartment management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Total Units</p>
          <h3 className="text-primary mb-2">{totalUnits}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-success">{occupiedUnits} Occupied</span>
            <span className="text-text-secondary">•</span>
            <span className="text-text-secondary">{totalUnits - occupiedUnits} Available</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Occupancy Rate</p>
          <h3 className="text-success mb-2">{occupancyRate}%</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Revenue This Month</p>
          <h3 className="text-accent mb-2">{formatCurrency(totalRevenue)}</h3>
          <p className="text-xs text-success">↑ 12% from last month</p>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            {openTickets > 0 && <span className="badge badge-error">{openTickets}</span>}
          </div>
          <p className="text-sm text-text-secondary mb-1">Open Tickets</p>
          <h3 className="text-primary mb-2">{openTickets}</h3>
          <p className="text-xs text-text-secondary">Requires attention</p>
        </div>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-success/5 to-success/10 border-2 border-success/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-success">{mockPayments.filter(p => p.status === 'paid').length}</h3>
          </div>
          <p className="text-primary">Paid Invoices</p>
          <p className="text-sm text-text-secondary">All payments received</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-warning/5 to-warning/10 border-2 border-warning/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-warning rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-warning">{pendingPayments}</h3>
          </div>
          <p className="text-primary">Pending Payments</p>
          <p className="text-sm text-text-secondary">Awaiting payment</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-error/5 to-error/10 border-2 border-error/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-error rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-error">{overduePayments}</h3>
          </div>
          <p className="text-primary">Overdue Payments</p>
          <p className="text-sm text-text-secondary">Action required</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-primary">Recent Payments</h3>
            <Link to="/admin/payments" className="text-sm text-secondary hover:text-accent transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    payment.status === 'paid' ? 'bg-success/10' : 
                    payment.status === 'pending' ? 'bg-warning/10' : 'bg-error/10'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      payment.status === 'paid' ? 'text-success' :
                      payment.status === 'pending' ? 'text-warning' : 'text-error'
                    }`} />
                  </div>
                  <div>
                    <p className="text-primary text-sm">{payment.residentName}</p>
                    <p className="text-xs text-text-secondary">{payment.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary text-sm">{formatCurrency(payment.amount)}</p>
                  <span className={`badge ${
                    payment.status === 'paid' ? 'badge-success' :
                    payment.status === 'pending' ? 'badge-warning' : 'badge-error'
                  } text-xs`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-primary">Recent Complaints</h3>
            <Link to="/admin/complaints" className="text-sm text-secondary hover:text-accent transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-primary text-sm">{ticket.subject}</p>
                    <p className="text-xs text-text-secondary">{ticket.residentName} • {ticket.unitNumber}</p>
                  </div>
                  <span className={`badge ${
                    ticket.priority === 'Urgent' ? 'badge-error' :
                    ticket.priority === 'High' ? 'badge-warning' : 'badge-info'
                  } text-xs`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="badge badge-info text-xs">{ticket.category}</span>
                  <span className={`text-xs ${
                    ticket.status === 'Open' ? 'text-error' :
                    ticket.status === 'In Progress' ? 'text-warning' : 'text-success'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/units/new" className="p-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center">
            <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-primary">Add Unit</p>
          </Link>
          
          <Link to="/admin/residents/new" className="p-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-primary">Add Resident</p>
          </Link>
          
          <Link to="/admin/payments/generate" className="p-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center">
            <CreditCard className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-primary">Generate Invoice</p>
          </Link>
          
          <Link to="/admin/reports" className="p-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-primary">View Reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
