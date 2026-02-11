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
} from 'stream-chat-react';
import { getStreamClient } from '../../utils/streamClient';

import 'stream-chat-react/dist/css/v2/index.css';
import './stream-custom.css';

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
          <div className="flex h-full overflow-hidden bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="w-full lg:w-96 border-r border-gray-200">
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
              />
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
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
        </Chat>
      </div>

      <BottomTabNavigation />

      <ComposeMessageModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onConversationCreated={() => {}}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default Messages;
