import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import adminService from '../../../utils/adminService';
import Modal from '../../../components/Modal';

const SupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    setLoading(true);
    const result = await adminService.getSupportTickets(filters);
    
    if (result.success) {
      setTickets(result.data || []);
    }
    
    setLoading(false);
  };

  const handleViewTicket = async (ticketId) => {
    const result = await adminService.getSupportTicket(ticketId);
    
    if (result.success) {
      setSelectedTicket(result.data);
      setShowTicketModal(true);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    const result = await adminService.updateSupportTicket(ticketId, { status: newStatus });
    
    if (result.success) {
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    }
  };

  const handleAssignTicket = async (ticketId) => {
    const result = await adminService.updateSupportTicket(ticketId, { assigned_to: user.id });
    
    if (result.success) {
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, assigned_to: user.id });
      }
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim() || !selectedTicket) return;
    
    setSubmitting(true);
    const result = await adminService.addTicketResponse(
      selectedTicket.id,
      user.id,
      response,
      true // is_admin_response
    );
    
    if (result.success) {
      setResponse('');
      // Refresh ticket details
      const updatedTicket = await adminService.getSupportTicket(selectedTicket.id);
      if (updatedTicket.success) {
        setSelectedTicket(updatedTicket.data);
      }
    }
    
    setSubmitting(false);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.open;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      bug: '🐛',
      feature_request: '✨',
      complaint: '😞',
      question: '❓',
      other: '📋',
    };
    return icons[category] || icons.other;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="bug">Bug</option>
              <option value="feature_request">Feature Request</option>
              <option value="complaint">Complaint</option>
              <option value="question">Question</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600">There are no support tickets matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewTicket(ticket.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>👤 {ticket.user?.full_name || 'Unknown User'}</span>
                  <span>📅 {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
                {ticket.assigned_admin && (
                  <span className="text-purple-600">Assigned to: {ticket.assigned_admin.full_name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <Modal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
            setResponse('');
          }}
          title="Ticket Details"
        >
          <div className="space-y-4">
            {/* Ticket Header */}
            <div className="border-b pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{getCategoryIcon(selectedTicket.category)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedTicket.subject}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {selectedTicket.user?.full_name} ({selectedTicket.user?.email})
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
              <p className="text-gray-700">{selectedTicket.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Created: {new Date(selectedTicket.created_at).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {!selectedTicket.assigned_to && (
                <button
                  onClick={() => handleAssignTicket(selectedTicket.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Assign to Me
                </button>
              )}
              {selectedTicket.status === 'open' && (
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark In Progress
                </button>
              )}
              {selectedTicket.status === 'in_progress' && (
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark Resolved
                </button>
              )}
              {selectedTicket.status === 'resolved' && (
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close Ticket
                </button>
              )}
            </div>

            {/* Responses */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Conversation</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedTicket.responses?.map((resp) => (
                  <div
                    key={resp.id}
                    className={`p-3 rounded-lg ${
                      resp.is_admin_response ? 'bg-purple-50 ml-8' : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {resp.user?.full_name}
                        {resp.user?.role === 'admin' && ' (Admin)'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(resp.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{resp.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Form */}
            {selectedTicket.status !== 'closed' && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your response here..."
                />
                <button
                  onClick={handleSubmitResponse}
                  disabled={submitting || !response.trim()}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupportTickets;