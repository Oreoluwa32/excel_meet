import { StreamChat } from 'stream-chat';
import { supabase } from './supabase';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

/**
 * Singleton instance of StreamChat client
 */
let chatClient = null;

/**
 * Get or initialize the Stream Chat client
 * @returns {StreamChat} The chat client instance
 */
export const getStreamClient = () => {
  if (!chatClient) {
    if (STREAM_API_KEY) {
      chatClient = StreamChat.getInstance(STREAM_API_KEY);
      console.log('📡 Stream Chat client instance created');
    } else {
      console.error('❌ Stream API Key (VITE_STREAM_API_KEY) is missing');
    }
  }
  return chatClient;
};

/**
 * Connect a user to Stream Chat
 * @param {object} user - The Supabase user object
 * @param {object} profile - User profile data (optional)
 * @returns {Promise<object>} The connected user object
 */
export const connectStreamUser = async (user, profile = null) => {
  if (!user) return null;
  
  const client = getStreamClient();
  if (!client) {
    console.warn('Stream API Key not configured');
    return null;
  }

  // If already connected with the same user, just return the user
  if (client.userID === user.id) {
    return client.user;
  }

  try {
    // 1. Fetch token from Supabase Edge Function
    console.log('🎟️ Fetching Stream token for user:', user.id);
    const { data, error } = await supabase.functions.invoke('stream-token', {
      body: { user_id: user.id }
    });

    if (error || !data?.token) {
      console.error('❌ Supabase function error:', error);
      throw new Error(error?.message || 'Failed to get Stream token');
    }

    // 2. Prepare user data
    const userData = {
      id: user.id,
      name: profile?.full_name || user.email?.split('@')[0] || 'User',
      image: profile?.avatar_url || null,
      email: user.email,
    };

    // 3. Connect user
    await client.connectUser(userData, data.token);
    
    console.log('✅ Connected to Stream Chat as:', userData.name);
    return client.user;
  } catch (err) {
    console.error('❌ Error connecting to Stream Chat:', err);
    return null;
  }
};

/**
 * Disconnect the current user from Stream Chat
 */
export const disconnectStreamUser = async () => {
  if (chatClient) {
    await chatClient.disconnectUser();
    console.log('🔌 Disconnected from Stream Chat');
  }
};

/**
 * Get or create a 1-on-1 conversation channel
 * @param {string} otherUserId - The ID of the other participant
 * @param {string} jobId - Optional job ID to context-link the chat
 * @returns {Promise<Channel>} The Stream Chat channel
 */
export const getOrCreateChannel = async (otherUserId, jobId = null) => {
  const client = getStreamClient();
  if (!client || !client.userID) return null;

  // Create a channel ID based on participants to ensure uniqueness for 1:1
  const members = [client.userID, otherUserId].sort();
  const channelId = `chat-${members.join('-')}${jobId ? `-${jobId}` : ''}`.substring(0, 64);

  const channel = client.channel('messaging', channelId, {
    members: [client.userID, otherUserId],
    job_id: jobId,
  });

  await channel.watch();
  return channel;
};
