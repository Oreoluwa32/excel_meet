import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import DetailViewModal from '../../components/ui/DetailViewModal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/EmptyState';

/**
 * Notifications Page
 * Full page view for managing notifications
 */
const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  } = useNotifications();

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to link if provided
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    const { success, count } = await markAllAsRead();
    if (success) {
      console.log(`Marked ${count} notifications as read`);
    }
  };

  const handleDeleteAllRead = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all read notifications?');
    if (confirmed) {
      const { success, count } = await deleteAllRead();
      if (success) {
        console.log(`Deleted ${count} notifications`);
      }
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    const confirmed = window.confirm('Delete this notification?');
    if (confirmed) {
      await deleteNotification(notificationId);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      application_submitted: '📝',
      application_accepted: '🎉',
      application_rejected: '📋',
      application_withdrawn: '↩️',
      job_posted: '💼',
      job_updated: '🔄',
      job_deleted: '🗑️',
      review_received: '⭐',
      message_received: '💬',
      system_announcement: '📢'
    };
    return iconMap[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      application_accepted: 'bg-green-50 border-green-200',
      application_rejected: 'bg-red-50 border-red-200',
      application_submitted: 'bg-blue-50 border-blue-200',
      job_deleted: 'bg-red-50 border-red-200',
      review_received: 'bg-yellow-50 border-yellow-200',
      system_announcement: 'bg-purple-50 border-purple-200'
    };
    return colorMap[type] || 'bg-gray-50 border-gray-200';
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  return (
    <DetailViewModal
      isOpen={true}
      onClose={() => navigate(-1)}
      title="Notifications"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Read ({notifications.filter(n => n.read).length})
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                icon={CheckCheck}
              >
                Mark all read
              </Button>
            )}
            {notifications.some(n => n.read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAllRead}
                icon={Trash2}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Clear read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={
              filter === 'unread'
                ? 'No unread notifications'
                : filter === 'read'
                ? 'No read notifications'
                : 'No notifications yet'
            }
            description={
              filter === 'all'
                ? "You'll receive notifications here when there's activity on your jobs or applications."
                : `You have no ${filter} notifications at the moment.`
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg border-2 p-4 hover:shadow-md cursor-pointer transition-all ${
                  !notification.read
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`text-base font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true
                        })}
                      </p>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DetailViewModal>
  );
};

export default NotificationsPage;