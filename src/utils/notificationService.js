import { supabase } from './supabase';

/**
 * Notification Service
 * Handles all notification-related database operations
 */

/**
 * Fetch notifications for current user
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of notifications to fetch
 * @param {boolean} options.unreadOnly - Fetch only unread notifications
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchNotifications = async ({ limit = 50, unreadOnly = false } = {}) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchNotifications:', error);
    return { data: [], error };
  }
};

/**
 * Get unread notification count
 * @returns {Promise<{count: number, error: Error|null}>}
 */
export const getUnreadCount = async () => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return { count: 0, error };
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const markAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return { success: false, error };
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<{success: boolean, count: number, error: Error|null}>}
 */
export const markAllAsRead = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('read', false)
      .select();

    if (error) {
      console.error('Error marking all as read:', error);
      return { success: false, count: 0, error };
    }

    return { success: true, count: data?.length || 0, error: null };
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return { success: false, count: 0, error };
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return { success: false, error };
  }
};

/**
 * Delete all read notifications
 * @returns {Promise<{success: boolean, count: number, error: Error|null}>}
 */
export const deleteAllRead = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true)
      .select();

    if (error) {
      console.error('Error deleting read notifications:', error);
      return { success: false, count: 0, error };
    }

    return { success: true, count: data?.length || 0, error: null };
  } catch (error) {
    console.error('Error in deleteAllRead:', error);
    return { success: false, count: 0, error };
  }
};

/**
 * Create a manual notification (for testing or admin use)
 * @param {Object} notification - Notification data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createNotification = async ({ userId, type, title, message, link, metadata }) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        link,
        metadata: metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return { data: null, error };
  }
};

/**
 * Subscribe to real-time notifications
 * @param {Function} callback - Callback function to handle new notifications
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToNotifications = (callback) => {
  const channel = supabase
    .channel('notifications-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
      },
      (payload) => {
        console.log('New notification received:', payload);
        callback(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};

export default {
  fetchNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createNotification,
  subscribeToNotifications
};