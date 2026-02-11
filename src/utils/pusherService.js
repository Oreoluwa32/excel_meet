import { getPusherInstance, subscribeToChannel, unsubscribeFromChannel } from './pusherClient';

/**
 * Subscribe to new messages in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {function} onNewMessage - Callback when new message arrives
 * @returns {object} Channel subscription object
 */
export const subscribeToConversationMessages = (conversationId, onNewMessage) => {
  const pusher = getPusherInstance();
  
  // Fallback to null if Pusher not configured
  if (!pusher) {
    console.warn('Pusher not available, using polling fallback');
    return null;
  }

  const channelName = `chat-${conversationId}`;
  const channel = subscribeToChannel(channelName);

  if (channel) {
    channel.bind('new-message', (data) => {
      console.log('📨 New message received via Pusher:', data);
      onNewMessage(data);
    });

    channel.bind('message-read', (data) => {
      console.log('✅ Message marked as read via Pusher:', data);
      // You can handle read receipts here if needed
    });
  }

  return channel;
};

/**
 * Subscribe to conversation list updates for a user
 * @param {string} userId - The user ID
 * @param {function} onUpdate - Callback when conversation list updates
 * @returns {object} Channel subscription object
 */
export const subscribeToUserConversations = (userId, onUpdate) => {
  const pusher = getPusherInstance();
  
  if (!pusher) {
    console.warn('Pusher not available, using polling fallback');
    return null;
  }

  const channelName = `user-${userId}-conversations`;
  const channel = subscribeToChannel(channelName);

  if (channel) {
    channel.bind('conversation-updated', (data) => {
      console.log('🔄 Conversation updated via Pusher:', data);
      onUpdate(data);
    });

    channel.bind('new-conversation', (data) => {
      console.log('✨ New conversation via Pusher:', data);
      onUpdate(data);
    });
  }

  return channel;
};

/**
 * Unsubscribe from conversation messages
 * @param {string} conversationId - The conversation ID
 */
export const unsubscribeFromConversationMessages = (conversationId) => {
  const channelName = `chat-${conversationId}`;
  unsubscribeFromChannel(channelName);
};

/**
 * Unsubscribe from user conversations
 * @param {string} userId - The user ID
 */
export const unsubscribeFromUserConversations = (userId) => {
  const channelName = `user-${userId}-conversations`;
  unsubscribeFromChannel(channelName);
};

/**
 * Trigger a Pusher event (client-side trigger)
 * Note: This requires enabling client events in Pusher dashboard
 * Alternative: Use Supabase Edge Function or your own backend
 */
export const triggerPusherEvent = async (channel, event, data) => {
  // This is a placeholder - you'll need to implement server-side triggering
  // via Supabase Edge Function or a backend API
  console.log('Trigger event:', { channel, event, data });
  
  // For now, we'll trigger via a Supabase Edge Function
  // You can implement this later
  return { success: true };
};