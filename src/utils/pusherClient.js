import Pusher from 'pusher-js';

/**
 * Pusher Client Configuration
 * 
 * To use this:
 * 1. Sign up at https://pusher.com (free tier available)
 * 2. Create a new app in Pusher dashboard
 * 3. Copy your credentials and add them to .env file:
 *    REACT_APP_PUSHER_KEY=your_key_here
 *    REACT_APP_PUSHER_CLUSTER=your_cluster_here (e.g., 'us2', 'eu', 'ap1')
 */

let pusherInstance = null;

export const initializePusher = () => {
  if (pusherInstance) {
    return pusherInstance;
  }

  const pusherKey = process.env.REACT_APP_PUSHER_KEY;
  const pusherCluster = process.env.REACT_APP_PUSHER_CLUSTER || 'us2';

  if (!pusherKey) {
    console.warn('Pusher key not found. Real-time messaging will use polling fallback.');
    return null;
  }

  try {
    pusherInstance = new Pusher(pusherKey, {
      cluster: pusherCluster,
      encrypted: true,
      authEndpoint: '/api/pusher/auth', // Optional: for private channels
    });

    pusherInstance.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully');
    });

    pusherInstance.connection.bind('error', (err) => {
      console.error('❌ Pusher connection error:', err);
    });

    return pusherInstance;
  } catch (error) {
    console.error('Failed to initialize Pusher:', error);
    return null;
  }
};

export const getPusherInstance = () => {
  if (!pusherInstance) {
    return initializePusher();
  }
  return pusherInstance;
};

/**
 * Subscribe to a channel
 */
export const subscribeToChannel = (channelName) => {
  const pusher = getPusherInstance();
  if (!pusher) return null;

  return pusher.subscribe(channelName);
};

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = (channelName) => {
  const pusher = getPusherInstance();
  if (!pusher) return;

  pusher.unsubscribe(channelName);
};

/**
 * Disconnect Pusher
 */
export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};

export default {
  initializePusher,
  getPusherInstance,
  subscribeToChannel,
  unsubscribeFromChannel,
  disconnectPusher,
};