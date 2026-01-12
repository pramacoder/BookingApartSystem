import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getResidentId, getResidentTickets, createTicket, getTicketWithUpdates, addTicketUpdate } from '../../lib/database';
import type { Ticket, TicketUpdate } from '../../lib/types/database';
import { Loader2, MessageSquare, Plus, X, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';

interface TicketWithUpdates {
  ticket: Ticket;
  updates: TicketUpdate[];
}

export function ComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithUpdates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Create ticket form state
  const [formData, setFormData] = useState({
    category: 'maintenance',
    priority: 'medium',
    subject: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Add update form state
  const [updateMessage, setUpdateMessage] = useState('');
  const [addingUpdate, setAddingUpdate] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const residentId = await getResidentId(user.id);

      if (!residentId) {
        setError('Resident data not found');
        setLoading(false);
        return;
      }

      const { data: ticketsData, error: ticketsError } = await getResidentTickets(residentId);
      if (ticketsError) throw ticketsError;

      setTickets(ticketsData || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetail = async (ticketId: string) => {
    try {
      const { data, error } = await getTicketWithUpdates(ticketId);
      if (error) throw error;
      if (data) {
        setSelectedTicket(data);
        setShowDetailModal(true);
      }
    } catch (err: any) {
      console.error('Error loading ticket detail:', err);
      setError('Gagal memuat detail ticket.');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const residentId = await getResidentId(user.id);
      if (!residentId) {
        setError('Resident data not found');
        return;
      }

      const { data, error: createError } = await createTicket({
        resident_id: residentId,
        category: formData.category,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description,
      });

      if (createError) throw createError;

      setShowCreateModal(false);
      setFormData({
        category: 'maintenance',
        priority: 'medium',
        subject: '',
        description: '',
      });
      await loadTickets();
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError('Gagal membuat ticket. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!user || !selectedTicket || !updateMessage.trim()) return;

    try {
      setAddingUpdate(true);
      const { error: updateError } = await addTicketUpdate({
        ticket_id: selectedTicket.ticket.id,
        user_id: user.id,
        message: updateMessage,
        is_internal: false,
      });

      if (updateError) throw updateError;

      setUpdateMessage('');
      await loadTicketDetail(selectedTicket.ticket.id);
      await loadTickets();
    } catch (err: any) {
      console.error('Error adding update:', err);
      setError('Gagal menambahkan update. Silakan coba lagi.');
    } finally {
      setAddingUpdate(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterCategory !== 'all' && ticket.category !== filterCategory) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Memuat data tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary mb-2">Complaints & Tickets</h1>
          <p className="text-text-secondary">Submit and track your complaints</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Ticket
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
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-primary mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-primary mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="complaint">Complaint</option>
              <option value="request">Request</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-primary mb-2">No Tickets Found</h2>
          <p className="text-text-secondary mb-6">
            {tickets.length === 0
              ? "You don't have any tickets yet. Create a new ticket to get started."
              : `No tickets found with selected filters.`
            }
          </p>
          {tickets.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => loadTicketDetail(ticket.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-primary font-semibold">{ticket.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-text-secondary mb-3 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                    <div className="text-primary font-medium">
                      #{ticket.ticket_number}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">Create New Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-primary mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="complaint">Complaint</option>
                    <option value="request">Request</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-primary mb-2">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-primary mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={5}
                  placeholder="Detailed description of the issue..."
                  required
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
                    'Create Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-primary font-semibold">{selectedTicket.ticket.subject}</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTicket(null);
                  setUpdateMessage('');
                }}
                className="text-text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTicket.ticket.status)}`}>
                    {selectedTicket.ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Priority</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(selectedTicket.ticket.priority)}`}>
                    {selectedTicket.ticket.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Category</p>
                  <p className="text-primary font-medium capitalize">{selectedTicket.ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Ticket #</p>
                  <p className="text-primary font-medium">{selectedTicket.ticket.ticket_number}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-text-secondary mb-2">Description</p>
                <p className="text-primary whitespace-pre-wrap">{selectedTicket.ticket.description}</p>
              </div>

              {/* Updates/Conversation */}
              <div>
                <h3 className="text-primary font-semibold mb-4">Updates</h3>
                <div className="space-y-4">
                  {selectedTicket.updates.length === 0 ? (
                    <p className="text-text-secondary text-center py-4">No updates yet</p>
                  ) : (
                    selectedTicket.updates.map((update) => (
                      <div key={update.id} className="border-l-2 border-primary pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-secondary">{formatDate(update.created_at)}</span>
                          {update.is_internal && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Internal</span>
                          )}
                        </div>
                        <p className="text-primary whitespace-pre-wrap">{update.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Update */}
              {selectedTicket.ticket.status !== 'closed' && selectedTicket.ticket.status !== 'cancelled' && (
                <div className="border-t pt-4">
                  <label className="block text-sm text-primary mb-2">Add Update</label>
                  <textarea
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    className="input-field mb-3"
                    rows={3}
                    placeholder="Add a comment or update..."
                  />
                  <button
                    onClick={handleAddUpdate}
                    className="btn-primary"
                    disabled={addingUpdate || !updateMessage.trim()}
                  >
                    {addingUpdate ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </div>
                    ) : (
                      'Add Update'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




