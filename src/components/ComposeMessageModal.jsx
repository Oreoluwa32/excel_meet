import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Icon from './AppIcon';
import { searchUsers } from '../utils/userService';
import { getOrCreateChannel } from '../utils/streamClient';

export const ComposeMessageModal = ({ isOpen, onClose, onConversationCreated, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setSearching(true);
        const { data } = await searchUsers(searchTerm);
        // Filter out current user
        setSearchResults((data || []).filter(u => u.id !== currentUserId));
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUserId]);

  const handleStartConversation = async () => {
    if (!selectedUser) return;

    setCreating(true);
    // Start a direct conversation (jobId is null)
    const channel = await getOrCreateChannel(selectedUser.id);

    if (!channel) {
      alert('Failed to start conversation. Please try again.');
    } else {
      onConversationCreated(channel);
      handleClose();
    }
    setCreating(false);
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Message"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To:
          </label>
          <div className="relative">
            <Input
              value={selectedUser ? selectedUser.full_name : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedUser) setSelectedUser(null);
              }}
              placeholder="Search by name or email..."
              className="pr-10"
              disabled={!!selectedUser}
            />
            {selectedUser && (
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>
        </div>

        {searching && (
          <div className="flex justify-center py-4">
            <Icon name="Loader" size={24} className="animate-spin text-blue-600" />
          </div>
        )}

        {!selectedUser && searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon name="User" size={20} className="text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {!selectedUser && searchTerm.trim().length >= 2 && !searching && searchResults.length === 0 && (
          <p className="text-center py-4 text-gray-500 text-sm">
            No users found matching "{searchTerm}"
          </p>
        )}

        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={!selectedUser || creating}
            onClick={handleStartConversation}
          >
            {creating ? 'Starting...' : 'Start Chat'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ComposeMessageModal;
