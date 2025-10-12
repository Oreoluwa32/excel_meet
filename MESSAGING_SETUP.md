# Messaging System Setup Guide

## Overview
A real-time messaging system has been implemented that allows professionals and job posters to communicate directly about job opportunities.

## Features Implemented

### 1. Database Schema
- **conversations table**: Stores conversation metadata between two users for a specific job
- **messages table**: Stores individual messages within conversations
- Real-time subscriptions using Supabase Realtime
- Row Level Security (RLS) policies for data protection
- Automatic conversation updates when new messages are sent

### 2. Messaging Service (`src/utils/messagingService.js`)
- `getOrCreateConversation()`: Creates or retrieves a conversation between two users
- `getUserConversations()`: Gets all conversations for a user with unread counts
- `getConversationMessages()`: Retrieves all messages in a conversation
- `sendMessage()`: Sends a new message
- `markMessagesAsRead()`: Marks messages as read
- `subscribeToMessages()`: Real-time subscription to new messages
- `subscribeToConversations()`: Real-time subscription to conversation updates
- `getUnreadMessageCount()`: Gets total unread message count for a user

### 3. Messages Page (`src/pages/messages/index.jsx`)
- Split-view interface (conversation list + message thread)
- Real-time message updates
- Unread message indicators
- Auto-scroll to latest messages
- Mobile-responsive design
- Direct link to view job details from conversation

### 4. UI Updates
- **JobActions Component**: Changed "Ask Question" button to "Message"
- **Navigation**: Added "Messages" tab to both mobile and desktop navigation
- **Header**: Added messages icon with unread count badge
- **BottomTabNavigation**: Added Messages tab with unread count

### 5. Integration
- Clicking "Message" on a job details page creates/opens a conversation
- Seamless navigation between job details and messages
- Real-time updates across all components

## Setup Instructions

### Step 1: Run Database Migration

You need to apply the database migration to create the messaging tables:

```powershell
# Navigate to project directory
Set-Location "c:\Users\oreol\Documents\Projects\excel_meet"

# Run the migration using Supabase CLI
npx supabase db push
```

**Alternative: Manual Migration**

If the above doesn't work, you can manually run the migration:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (izxjmcfbhktnmtqbdjkm)
3. Go to SQL Editor
4. Copy the contents of `supabase/migrations/20250130000000_create_messaging_system.sql`
5. Paste and run the SQL

### Step 2: Enable Realtime

Ensure Realtime is enabled for the messaging tables:

1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for:
   - `conversations` table
   - `messages` table

### Step 3: Test the Application

```powershell
# Start the development server
npm start
```

## How to Use

### For Professionals:
1. Browse jobs on the Search/Discovery page
2. Click on a job to view details
3. Click the "Message" button to start a conversation with the job poster
4. Access all your conversations from the Messages tab in the navigation

### For Job Posters:
1. Post a job on the Home Dashboard
2. When professionals message you about your job, you'll see the conversation in the Messages tab
3. Respond to inquiries directly through the messaging interface

## Features

### Real-Time Messaging
- Messages appear instantly without page refresh
- Typing and sending messages is smooth and responsive
- Unread counts update automatically

### Conversation Management
- Each conversation is tied to a specific job
- View job details directly from the conversation
- See conversation history and participant info

### Notifications
- Unread message count badge in navigation
- Visual indicators for unread conversations
- Messages marked as read when viewed

## Technical Details

### Database Structure

**conversations table:**
- `id`: UUID (Primary Key)
- `job_id`: UUID (Foreign Key to jobs)
- `participant_1_id`: UUID (Foreign Key to auth.users)
- `participant_2_id`: UUID (Foreign Key to auth.users)
- `last_message_at`: Timestamp
- `created_at`: Timestamp
- `updated_at`: Timestamp

**messages table:**
- `id`: UUID (Primary Key)
- `conversation_id`: UUID (Foreign Key to conversations)
- `sender_id`: UUID (Foreign Key to auth.users)
- `content`: Text
- `is_read`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only view/send messages in their own conversations
- Automatic participant ordering ensures conversation uniqueness

### Performance
- Indexed queries for fast lookups
- Efficient real-time subscriptions
- Optimized unread count calculations

## Troubleshooting

### Migration Fails
- Ensure you're connected to the correct Supabase project
- Check that you have the necessary permissions
- Try running the SQL manually in the Supabase Dashboard

### Messages Not Appearing in Real-Time
- Check that Realtime is enabled for the tables
- Verify your Supabase connection in the browser console
- Ensure you're using the correct Supabase URL and anon key

### Unread Counts Not Updating
- The counts refresh every 30 seconds automatically
- Navigate away and back to the Messages page to force a refresh
- Check browser console for any errors

## Future Enhancements

Potential improvements for the messaging system:
- File/image attachments
- Message reactions/emojis
- Typing indicators
- Message search functionality
- Message deletion/editing
- Push notifications
- Email notifications for new messages
- Message templates for common responses
- Conversation archiving
- Block/report functionality

## Files Modified/Created

### Created:
- `supabase/migrations/20250130000000_create_messaging_system.sql`
- `src/utils/messagingService.js`
- `src/pages/messages/index.jsx`

### Modified:
- `src/pages/job-details/index.jsx`
- `src/pages/job-details/components/JobActions.jsx`
- `src/components/ui/Header.jsx`
- `src/components/ui/BottomTabNavigation.jsx`
- `src/Routes.jsx`

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify database migration was successful
3. Ensure Realtime is enabled in Supabase
4. Check that all environment variables are set correctly