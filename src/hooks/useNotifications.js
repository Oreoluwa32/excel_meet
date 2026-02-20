import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import * as notificationService from '../utils/notificationService';

/**
 * Custom hook for managing notifications with real-time updates
 * @returns {Object} Notification state and methods
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await notificationService.fetchNotifications(options);

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    setNotifications(data);
    setLoading(false);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const { count, error: countError } = await notificationService.getUnreadCount();

    if (countError) {
      console.error('Error fetching unread count:', countError);
      return;
    }

    setUnreadCount(count);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    const { success } = await notificationService.markAsRead(notificationId);

    if (success) {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    return success;
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const { success, count } = await notificationService.markAllAsRead();

    if (success) {
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          read: true,
          read_at: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    }

    return { success, count };
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    const { success } = await notificationService.deleteNotification(notificationId);

    if (success) {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        return prev.filter(notif => notif.id !== notificationId);
      });
    }

    return success;
  }, []);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    const { success, count } = await notificationService.deleteAllRead();

    if (success) {
      setNotifications(prev => prev.filter(notif => !notif.read));
    }

    return { success, count };
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    let channel;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      try {
        channel = supabase
          .channel(`notifications-realtime-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('New notification received:', payload.new);
              
              setNotifications(prev => [payload.new, ...prev]);
              setUnreadCount(prev => prev + 1);

              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(payload.new.title, {
                  body: payload.new.message,
                  icon: '/logo.png',
                  badge: '/logo.png'
                });
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Notification updated:', payload.new);
              
              setNotifications(prev =>
                prev.map(notif =>
                  notif.id === payload.new.id ? payload.new : notif
                )
              );

              if (payload.old.read !== payload.new.read) {
                setUnreadCount(prev => payload.new.read ? Math.max(0, prev - 1) : prev + 1);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Notification deleted:', payload.old);
              
              setNotifications(prev => {
                const notification = prev.find(n => n.id === payload.old.id);
                if (notification && !notification.read) {
                  setUnreadCount(prevCount => Math.max(0, prevCount - 1));
                }
                return prev.filter(notif => notif.id !== payload.old.id);
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Notification subscription established');
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.error('Notification subscription error:', status);
            }
          });
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    requestNotificationPermission
  };
};

export default useNotifications;