import { StreamChat } from 'stream-chat';
import { supabase } from './supabase';
import { fetchUserProfile } from './userService';

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
  console.log('🏗️ Attempting to get/create channel with:', otherUserId);
  const client = getStreamClient();
  if (!client || !client.userID) {
    console.error('❌ Stream client not initialized or user not connected');
    return null;
  }

  try {
    // Check if the other user exists in Stream, if not, upsert them
    console.log('🔍 Checking if user exists in Stream:', otherUserId);
    const userResponse = await client.queryUsers({ id: { $in: [otherUserId] } });
    
    if (userResponse.users.length === 0) {
      console.log('👤 User not found in Stream, syncing from Supabase...');
      const { data: profile } = await fetchUserProfile(otherUserId);
      if (profile) {
        await client.upsertUser({
          id: otherUserId,
          name: profile.full_name || 'User',
          image: profile.avatar_url || null,
        });
        console.log('✅ User synced to Stream');
      } else {
        console.warn('⚠️ Could not find user profile in Supabase to sync');
      }
    }

    // For 1:1 messaging, it's often better to let Stream generate the ID 
    console.log('📡 Initializing channel...');
    const channel = client.channel('messaging', {
      members: [client.userID, otherUserId],
      job_id: jobId,
    });

    console.log('👀 Watching channel...');
    await channel.watch();
    console.log('✅ Channel ready:', channel.id);
    return channel;
  } catch (err) {
    console.error('❌ Error creating/watching channel:', err);
    return null;
  }
};
