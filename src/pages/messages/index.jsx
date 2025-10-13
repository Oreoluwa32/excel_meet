import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getConversationDetails
} from '../../utils/messagingService';
import {
  subscribeToConversationMessages,
  subscribeToUserConversations,
  unsubscribeFromConversationMessages,
  unsubscribeFromUserConversations
} from '../../utils/pusherService';
import { initializePusher } from '../../utils/pusherClient';

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationDetails, setConversationDetails] = useState(null);
  const [isPusherConnected, setIsPusherConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const pusherChannelRef = useRef(null);
  const conversationChannelRef = useRef(null);

  // Get conversation ID from navigation state (when coming from job details)
  const initialConversationId = location.state?.conversationId;

  // Initialize Pusher on mount
  useEffect(() => {
    const pusher = initializePusher();
    if (pusher) {
      setIsPusherConnected(true);
      console.log('✅ Pusher initialized - Real-time messaging enabled');
    } else {
      console.log('⚠️ Pusher not configured - Using polling fallback');
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await getUserConversations(user.id);
      
      if (error) {
        console.error('Error loading conversations:', error);
      } else {
        setConversations(data || []);
        
        // If there's an initial conversation ID, select it
        if (initialConversationId) {
          const conv = data?.find(c => c.id === initialConversationId);
          if (conv) {
            setSelectedConversation(conv);
          } else {
            // If conversation not found in list, fetch it directly
            console.log('Conversation not found in list, fetching directly...');
            const { data: convDetails, error: convError } = await getConversationDetails(initialConversationId);
            if (!convError && convDetails) {
              // Transform to match conversation list format
              const otherParticipant = convDetails.participant_1_id === user.id 
                ? convDetails.participant_2 
                : convDetails.participant_1;
              
              const transformedConv = {
                id: convDetails.id,
                jobId: convDetails.job_id,
                jobTitle: convDetails.jobs?.title,
                jobCategory: convDetails.jobs?.category,
                otherParticipant: {
                  id: otherParticipant?.id,
                  name: otherParticipant?.full_name || 'Unknown User',
                  avatar: otherParticipant?.avatar_url
                },
                lastMessage: null,
                unreadCount: 0,
                lastMessageAt: null,
                createdAt: convDetails.created_at
              };
              
              setSelectedConversation(transformedConv);
              // Add to conversations list if not already there
              setConversations(prev => [transformedConv, ...prev]);
            }
          }
        } else if (data && data.length > 0 && !selectedConversation) {
          // Auto-select first conversation if none selected
          setSelectedConversation(data[0]);
        }
      }
      setLoading(false);
    };

    loadConversations();
  }, [user, initialConversationId]);

  // Load messages for selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;

      const { data, error } = await getConversationMessages(selectedConversation.id);
      
      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
        scrollToBottom();
        
        // Mark messages as read
        await markMessagesAsRead(selectedConversation.id, user.id);
      }
    };

    loadMessages();
  }, [selectedConversation, user]);

  // Load conversation details
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedConversation) return;

      const { data, error } = await getConversationDetails(selectedConversation.id);
      
      if (!error && data) {
        setConversationDetails(data);
      }
    };

    loadDetails();
  }, [selectedConversation]);

  // Subscribe to new messages (Pusher or polling fallback)
  useEffect(() => {
    if (!selectedConversation) return;

    if (isPusherConnected) {
      // Use Pusher for real-time updates
      console.log('📡 Subscribing to Pusher channel:', `conversation-${selectedConversation.id}`);
      
      pusherChannelRef.current = subscribeToConversationMessages(
        selectedConversation.id,
        async (newMessage) => {
          console.log('📨 New message received:', newMessage);
          
          // Add new message to list
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
          
          // Mark as read if not sent by current user
          if (newMessage.senderId !== user.id) {
            await markMessagesAsRead(selectedConversation.id, user.id);
          }
        }
      );

      return () => {
        if (pusherChannelRef.current) {
          unsubscribeFromConversationMessages(selectedConversation.id);
          pusherChannelRef.current = null;
        }
      };
    } else {
      // Fallback to polling if Pusher not available
      const pollInterval = setInterval(async () => {
        const { data } = await getConversationMessages(selectedConversation.id);
        if (data && data.length > messages.length) {
          setMessages(data);
          scrollToBottom();
          await markMessagesAsRead(selectedConversation.id, user.id);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [selectedConversation, user, messages.length, isPusherConnected]);

  // Subscribe to conversation updates (Pusher or polling fallback)
  useEffect(() => {
    if (!user) return;

    if (isPusherConnected) {
      // Use Pusher for real-time conversation updates
      console.log('📡 Subscribing to user conversations:', `user-${user.id}-conversations`);
      
      conversationChannelRef.current = subscribeToUserConversations(
        user.id,
        async () => {
          console.log('🔄 Conversation list updated');
          const { data } = await getUserConversations(user.id);
          if (data) {
            setConversations(data);
          }
        }
      );

      return () => {
        if (conversationChannelRef.current) {
          unsubscribeFromUserConversations(user.id);
          conversationChannelRef.current = null;
        }
      };
    } else {
      // Fallback to polling if Pusher not available
      const pollInterval = setInterval(async () => {
        const { data } = await getUserConversations(user.id);
        if (data) {
          setConversations(data);
        }
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [user, isPusherConnected]);

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const { error } = await sendMessage(
      selectedConversation.id,
      user.id,
      newMessage
    );

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } else {
      setNewMessage('');
      
      // Immediately fetch updated messages
      const { data } = await getConversationMessages(selectedConversation.id);
      if (data) {
        setMessages(data);
        scrollToBottom();
      }
      
      // Refresh conversations list
      const { data: convData } = await getUserConversations(user.id);
      if (convData) {
        setConversations(convData);
      }
    }
    setSending(false);
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      if (diffInMinutes < 1) return 'Just now';
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Render conversation list item
  const ConversationItem = ({ conversation, isSelected }) => (
    <button
      onClick={() => setSelectedConversation(conversation)}
      className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {conversation.otherParticipant.avatar ? (
          <img
            src={conversation.otherParticipant.avatar}
            alt={conversation.otherParticipant.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon name="User" size={24} className="text-blue-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {conversation.otherParticipant.name}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 truncate mb-1">
          {conversation.jobTitle}
        </p>
        
        {conversation.lastMessage && (
          <p className="text-sm text-gray-500 truncate">
            {conversation.lastMessage.senderId === user.id ? 'You: ' : ''}
            {conversation.lastMessage.content}
          </p>
        )}
        
        {conversation.unreadCount > 0 && (
          <span className="inline-block mt-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {conversation.unreadCount}
          </span>
        )}
      </div>
    </button>
  );

  // Render message bubble
  const MessageBubble = ({ message, isOwn }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0">
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Icon name="User" size={16} className="text-gray-600" />
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        <div>
          {!isOwn && (
            <p className="text-xs text-gray-600 mb-1 ml-2">{message.senderName}</p>
          )}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-200 text-gray-900 rounded-bl-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right mr-2' : 'ml-2'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Messages" showBack={false} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
        <BottomTabNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Messages" showBack={false} />
      
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${
            selectedConversation ? 'hidden lg:block' : 'block'
          } w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto`}>
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Icon name="MessageCircle" size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-4">
                  Start a conversation by messaging a job poster
                </p>
                <Button onClick={() => navigate('/search-discovery')}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={selectedConversation?.id === conv.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className={`${
            selectedConversation ? 'block' : 'hidden lg:block'
          } flex-1 flex flex-col bg-white`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden"
                    >
                      <Icon name="ArrowLeft" size={20} />
                    </button>
                    
                    {selectedConversation.otherParticipant.avatar ? (
                      <img
                        src={selectedConversation.otherParticipant.avatar}
                        alt={selectedConversation.otherParticipant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Icon name="User" size={20} className="text-blue-600" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.otherParticipant.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.jobTitle}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/job-details', { 
                      state: { jobId: selectedConversation.jobId } 
                    })}
                  >
                    View Job
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map(msg => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={msg.senderId === user.id}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                  <div className="flex items-end space-x-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      rows="1"
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2"
                    >
                      {sending ? (
                        <Icon name="Loader" size={20} className="animate-spin" />
                      ) : (
                        <Icon name="Send" size={20} />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="hidden lg:flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon name="MessageCircle" size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomTabNavigation />
    </div>
  );
};

export default Messages;