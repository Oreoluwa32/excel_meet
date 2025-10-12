# Messaging System - Polling Implementation

## Overview
The messaging system uses **polling** instead of Supabase Realtime subscriptions because Realtime replication is not yet available in your Supabase project.

## How It Works

### Polling Strategy
Instead of receiving instant updates via WebSocket connections, the app periodically checks for new messages and conversations:

1. **Message Polling** (Messages Page)
   - Checks for new messages every **3 seconds** when viewing a conversation
   - Automatically scrolls to new messages
   - Marks messages as read when received

2. **Conversation List Polling** (Messages Page)
   - Refreshes conversation list every **5 seconds**
   - Updates unread counts and last message timestamps

3. **Unread Count Polling** (Header & Bottom Navigation)
   - Updates unread message badge every **30 seconds**
   - Shows count in both top header and bottom navigation

### User Experience
- **Sending Messages**: Instant update (no waiting for poll)
- **Receiving Messages**: Up to 3-second delay
- **Unread Counts**: Up to 30-second delay

## Performance Considerations

### Current Settings
```javascript
// Messages polling interval
const MESSAGE_POLL_INTERVAL = 3000; // 3 seconds

// Conversations polling interval
const CONVERSATION_POLL_INTERVAL = 5000; // 5 seconds

// Unread count polling interval
const UNREAD_COUNT_POLL_INTERVAL = 30000; // 30 seconds
```

### Optimization Tips
1. **Reduce polling frequency** if you notice performance issues
2. **Increase intervals** for less active users (e.g., 5-10 seconds for messages)
3. **Stop polling** when app is in background (future enhancement)

## Migration to Realtime (Future)

When Supabase Realtime becomes available:

1. **Enable Replication** in Supabase Dashboard:
   - Go to Database → Replication
   - Enable replication for `conversations` and `messages` tables

2. **Update Code**:
   - Replace polling intervals with `subscribeToMessages()` and `subscribeToConversations()`
   - The functions are already available in `messagingService.js`

3. **Code Changes Required**:

```javascript
// In src/pages/messages/index.jsx

// REPLACE THIS (Polling):
useEffect(() => {
  if (!selectedConversation) return;
  
  const pollInterval = setInterval(async () => {
    const { data } = await getConversationMessages(selectedConversation.id);
    if (data && data.length > messages.length) {
      setMessages(data);
      scrollToBottom();
      await markMessagesAsRead(selectedConversation.id, user.id);
    }
  }, 3000);
  
  return () => clearInterval(pollInterval);
}, [selectedConversation, user, messages.length]);

// WITH THIS (Realtime):
useEffect(() => {
  if (!selectedConversation) return;
  
  const subscription = subscribeToMessages(
    selectedConversation.id,
    (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
      
      if (newMessage.senderId !== user.id) {
        markMessagesAsRead(selectedConversation.id, user.id);
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, [selectedConversation, user]);
```

## Benefits of Current Approach

✅ **Works without Realtime**: No dependency on Supabase Realtime feature
✅ **Simple & Reliable**: Easy to understand and debug
✅ **Predictable Load**: Consistent server requests
✅ **Easy Migration**: Can switch to Realtime when available

## Limitations

⚠️ **Slight Delay**: 3-second delay for new messages
⚠️ **More Requests**: More database queries than Realtime
⚠️ **Battery Usage**: Continuous polling uses more battery on mobile

## Testing

To test the messaging system:

1. **Create two user accounts**
2. **Post a job** with one account
3. **View the job** with the other account and click "Message"
4. **Send messages** back and forth
5. **Observe**: Messages appear within 3 seconds
6. **Check badges**: Unread counts update within 30 seconds

## Troubleshooting

### Messages not appearing?
- Check browser console for errors
- Verify database migration was applied
- Ensure RLS policies are correct

### High server load?
- Increase polling intervals
- Reduce number of simultaneous users
- Consider implementing exponential backoff

### Want instant updates?
- Request early access to Supabase Realtime
- Or implement a custom WebSocket server