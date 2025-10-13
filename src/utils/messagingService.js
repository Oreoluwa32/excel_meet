import { supabase } from './supabase';

/**
 * Get or create a conversation between two users for a specific job
 */
export const getOrCreateConversation = async (jobId, userId1, userId2) => {
  try {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_job_id: jobId,
      p_user1_id: userId1,
      p_user2_id: userId2
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    return { data: null, error };
  }
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        job_id,
        participant_1_id,
        participant_2_id,
        last_message_at,
        created_at,
        jobs:job_id (
          id,
          title,
          category
        ),
        participant_1:participant_1_id (
          id,
          full_name,
          avatar_url
        ),
        participant_2:participant_2_id (
          id,
          full_name,
          avatar_url
        ),
        messages (
          id,
          content,
          sender_id,
          is_read,
          created_at
        )
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to include other participant info and last message
    const transformedData = data?.map(conv => {
      const otherParticipant = conv.participant_1_id === userId 
        ? conv.participant_2 
        : conv.participant_1;
      
      const lastMessage = conv.messages?.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];

      const unreadCount = conv.messages?.filter(
        msg => !msg.is_read && msg.sender_id !== userId
      ).length || 0;

      return {
        id: conv.id,
        jobId: conv.job_id,
        jobTitle: conv.jobs?.title,
        jobCategory: conv.jobs?.category,
        otherParticipant: {
          id: otherParticipant?.id,
          name: otherParticipant?.full_name || 'Unknown User',
          avatar: otherParticipant?.avatar_url
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.sender_id,
          createdAt: lastMessage.created_at,
          isRead: lastMessage.is_read
        } : null,
        unreadCount,
        lastMessageAt: conv.last_message_at,
        createdAt: conv.created_at
      };
    });

    // Sort by last_message_at (with null values at the end) or created_at
    transformedData?.sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { data: null, error };
  }
};

/**
 * Get messages for a specific conversation
 */
export const getConversationMessages = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        created_at,
        sender:sender_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const transformedData = data?.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderName: msg.sender?.full_name || 'Unknown User',
      senderAvatar: msg.sender?.avatar_url,
      content: msg.content,
      isRead: msg.is_read,
      createdAt: msg.created_at
    }));

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error };
  }
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (conversationId, senderId, content) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { error };
  }
};

/**
 * Subscribe to new messages in a conversation
 */
export const subscribeToMessages = (conversationId, callback) => {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        // Fetch the complete message with sender info
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            conversation_id,
            sender_id,
            content,
            is_read,
            created_at,
            sender:sender_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          const transformedMessage = {
            id: data.id,
            conversationId: data.conversation_id,
            senderId: data.sender_id,
            senderName: data.sender?.full_name || 'Unknown User',
            senderAvatar: data.sender?.avatar_url,
            content: data.content,
            isRead: data.is_read,
            createdAt: data.created_at
          };
          callback(transformedMessage);
        }
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Subscribe to conversation updates (for conversation list)
 */
export const subscribeToConversations = (userId, callback) => {
  const subscription = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_1_id=eq.${userId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_2_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return subscription;
};

/**
 * Get conversation details
 */
export const getConversationDetails = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        job_id,
        participant_1_id,
        participant_2_id,
        created_at,
        jobs:job_id (
          id,
          title,
          category,
          budget_min,
          budget_max,
          budget_type
        ),
        participant_1:participant_1_id (
          id,
          full_name,
          avatar_url
        ),
        participant_2:participant_2_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    return { data: null, error };
  }
};

/**
 * Get unread message count for a user
 */
export const getUnreadMessageCount = async (userId) => {
  try {
    // Get all conversations for the user
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);

    if (convError) throw convError;

    if (!conversations || conversations.length === 0) {
      return { count: 0, error: null };
    }

    const conversationIds = conversations.map(c => c.id);

    // Count unread messages in these conversations
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { count: 0, error };
  }
};