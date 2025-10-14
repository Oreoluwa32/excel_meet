import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Modal from '../../components/Modal';
import adminService from '../../utils/adminService';

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (!user) return;

      setLoading(true);
      const result = await adminService.getSupportTickets({
        userId: user.id, // Filter by current user
        ...filters,
      });

      if (result.success) {
        setTickets(result.data || []);
        
        // Auto-open ticket from URL parameter
        const ticketId = searchParams.get('ticket');
        if (ticketId) {
          const ticket = result.data?.find(t => t.id === ticketId);
          if (ticket) {
            setSelectedTicket(ticket);
          }
        }
      }
      setLoading(false);
    };

    loadTickets();
  }, [user, filters, searchParams]);

  // Load responses when ticket is selected
  useEffect(() => {
    const loadResponses = async () => {
      if (!selectedTicket) return;

      setLoadingResponses(true);
      const result = await adminService.getTicketResponses(selectedTicket.id);

      if (result.success) {
        setResponses(result.data || []);
      }
      setLoadingResponses(false);
    };

    loadResponses();
  }, [selectedTicket]);

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.open;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Support Tickets" showBack={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Support Tickets</h1>
          <p className="text-gray-600">View and track your support requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any support tickets yet.</p>
            <Button
              onClick={() => navigate('/home-dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <span className="text-2xl mr-2">{getCategoryIcon(ticket.category)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{ticket.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {ticket.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          onClick={() => setSelectedTicket(ticket)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket #${selectedTicket.id.slice(0, 8)}`}
          size="large"
        >
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Priority:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="ml-2 text-sm font-medium capitalize">
                    {getCategoryIcon(selectedTicket.category)} {selectedTicket.category.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="ml-2 text-sm font-medium">
                    {formatDate(selectedTicket.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Subject</h4>
                <p className="text-gray-700">{selectedTicket.subject}</p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Responses */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="MessageSquare" size={20} className="mr-2" />
                Conversation History
              </h4>
              
              {loadingResponses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : responses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="MessageCircle" size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No responses yet. An admin will respond soon.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.is_admin_response
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {response.is_admin_response ? (
                            <>
                              <Icon name="Shield" size={16} className="text-blue-600 mr-2" />
                              <span className="font-semibold text-blue-900">
                                {response.user_profiles?.full_name || 'Admin'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Icon name="User" size={16} className="text-gray-600 mr-2" />
                              <span className="font-semibold text-gray-900">You</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(response.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Info */}
            {selectedTicket.status === 'resolved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon name="CheckCircle" size={20} className="text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-green-900 mb-1">Ticket Resolved</h5>
                    <p className="text-sm text-green-700">
                      This ticket has been marked as resolved. If you need further assistance, please submit a new ticket.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon name="XCircle" size={20} className="text-gray-600 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">Ticket Closed</h5>
                    <p className="text-sm text-gray-700">
                      This ticket has been closed. If you need further assistance, please submit a new ticket.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      <BottomTabNavigation />
    </div>
  );
};

export default MyTickets;