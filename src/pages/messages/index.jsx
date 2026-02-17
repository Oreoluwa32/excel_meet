import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { ComposeMessageModal } from '../../components/ComposeMessageModal';
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  MessageList,
  MessageInput,
  Thread,
  ChannelHeader,
  useChatContext,
} from 'stream-chat-react';
import { getStreamClient } from '../../utils/streamClient';

import 'stream-chat-react/dist/css/v2/index.css';
import './stream-custom.css';

const ChatInner = ({ isComposeModalOpen, setIsComposeModalOpen, user, filters, sort, options }) => {
  const { channel: activeChannel, setActiveChannel } = useChatContext();

  // Use useEffect to log changes and debug mobile selection
  useEffect(() => {
    if (activeChannel) {
      console.log('📡 Active Channel Changed in Context:', activeChannel.id);
    }
  }, [activeChannel]);

  return (
    <div className="flex h-full overflow-hidden bg-white shadow-sm rounded-lg border border-gray-200">
      <div className={`${activeChannel ? 'hidden lg:block' : 'block'} w-full lg:w-96 border-r border-gray-200`}>
        <div className="stream-chat-header">
          <h2 className="font-semibold text-gray-900">Chats</h2>
          <button
            onClick={() => setIsComposeModalOpen(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="New Message"
          >
            <Icon name="SquareEdit" size={20} />
          </button>
        </div>
        <ChannelList 
          filters={filters} 
          sort={sort} 
          options={options}
          sendChannelsToList
          onSelect={(channel) => {
            console.log('📱 Mobile Select Channel (onSelect):', channel.id);
            setActiveChannel(channel);
          }}
        />
      </div>
      <div className={`${activeChannel ? 'flex' : 'hidden lg:flex'} flex-1 flex flex-col h-full overflow-hidden`}>
        {activeChannel && (
          <div className="lg:hidden p-3 border-b border-gray-200 flex items-center bg-white sticky top-0 z-10">
            <button 
              onClick={() => {
                console.log('🔙 Mobile Back to List');
                setActiveChannel(null);
              }}
              className="p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="flex-1 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                 <Icon name="User" size={16} />
              </div>
              <span className="font-semibold text-gray-900 truncate">
                {activeChannel.data?.name || activeChannel.data?.id}
              </span>
            </div>
          </div>
        )}
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </div>
    </div>
  );
};

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const chatClient = getStreamClient();

  useEffect(() => {
    if (chatClient?.userID) {
      setChatReady(true);
      return;
    }

    const checkConnection = setInterval(() => {
      if (chatClient?.userID) {
        setChatReady(true);
        clearInterval(checkConnection);
      }
    }, 500);

    return () => clearInterval(checkConnection);
  }, [chatClient]);

  const filters = { members: { $in: [user?.id] }, type: 'messaging' };
  const sort = { last_message_at: -1 };
  const options = { state: true, presence: true, limit: 10 };

  if (!chatReady || !chatClient || !chatClient.userID) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Messages" showBack={false} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to chat...</p>
          </div>
        </div>
        <BottomTabNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 stream-chat-container">
      <Header title="Messages" showBack={false} />
      
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)]">
        <Chat client={chatClient} theme="str-chat__theme-light">
          <ChatInner 
            key={chatClient.userID}
            isComposeModalOpen={isComposeModalOpen}
            setIsComposeModalOpen={setIsComposeModalOpen}
            user={user}
            filters={filters}
            sort={sort}
            options={options}
          />
        </Chat>
      </div>

      <BottomTabNavigation />

      <ComposeMessageModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onConversationCreated={(channel) => {
          // This will be handled by the context in the next render cycle 
          // but we might need to set it explicitly if Chat context doesn't auto-update
          console.log('🆕 New Conversation Created:', channel.id);
        }}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default Messages;
