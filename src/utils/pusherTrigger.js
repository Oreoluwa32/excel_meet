/**
 * Trigger Pusher events via Supabase Edge Function
 * 
 * This file provides functions to trigger Pusher events from the client.
 * Events are sent to a Supabase Edge Function which then triggers Pusher.
 * 
 * Setup required:
 * 1. Deploy the pusher-webhook Edge Function
 * 2. Set Pusher credentials in Supabase secrets
 */

import { supabase } from './supabase';

const EDGE_FUNCTION_URL = process.env.REACT_APP_PUSHER_WEBHOOK_URL;

/**
 * Trigger a new message event
 * @param {string} conversationId - The conversation ID
 * @param {object} messageData - The message data
 */
export const triggerNewMessage = async (conversationId, messageData) => {
  try {
    // If Edge Function URL is configured, use it
    if (EDGE_FUNCTION_URL) {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          channel: `conversation-${conversationId}`,
          event: 'new-message',
          data: messageData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger Pusher event');
      }

      console.log('✅ Pusher event triggered:', 'new-message');
      return { success: true };
    } else {
      // If no Edge Function, Pusher will rely on database webhooks
      console.log('⚠️ No Edge Function URL configured. Relying on database webhooks.');
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return { success: false, error };
  }
};

/**
 * Trigger a conversation update event
 * @param {string} userId - The user ID
 * @param {object} conversationData - The conversation data
 */
export const triggerConversationUpdate = async (userId, conversationData) => {
  try {
    if (EDGE_FUNCTION_URL) {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          channel: `user-${userId}-conversations`,
          event: 'conversation-updated',
          data: conversationData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger Pusher event');
      }

      console.log('✅ Pusher event triggered:', 'conversation-updated');
      return { success: true };
    } else {
      console.log('⚠️ No Edge Function URL configured. Relying on database webhooks.');
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return { success: false, error };
  }
};

/**
 * Note: For production, you should trigger Pusher events from the server
 * using Database Webhooks or Edge Functions. This ensures security and
 * prevents clients from triggering arbitrary events.
 * 
 * Alternative approaches:
 * 1. Database Webhooks (Recommended) - Automatically trigger on DB changes
 * 2. Supabase Edge Functions - Trigger from serverless functions
 * 3. Your own backend API - If you have a separate backend
 */