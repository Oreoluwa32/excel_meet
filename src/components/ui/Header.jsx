import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import NotificationBell from '../NotificationBell';
import Icon from '../AppIcon';
import SupportTicketForm from '../SupportTicketForm';
import { getUnreadMessageCount } from '../../utils/messagingService';
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react';

const Header = ({ title, showBack = false, showProfile = true }) => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSupportForm, setShowSupportForm] = useState(false);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await getUnreadMessageCount(user.id);
        if (error) {
          console.warn('Failed to load unread count:', error);
          setUnreadCount(0);
        } else {
          setUnreadCount(count || 0);
        }
      } catch (err) {
        console.warn('Error loading unread count:', err);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login-register');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                ←
              </Button>
            )}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {title || 'Excel-meet'}
              </h1>
              {!user && (
                <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Preview Mode
                </span>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Messages */}
                <button
                  onClick={() => navigate('/messages')}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Messages"
                >
                  <Icon name="MessageCircle" size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                <NotificationBell />

                {/* Support Button */}
                <button
                  onClick={() => setShowSupportForm(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Support"
                  title="Get Support"
                >
                  <Icon name="HelpCircle" size={20} />
                </button>

                {/* Profile Menu */}
                {showProfile && (
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <User size={20} />
                      <span className="hidden sm:block">
                        {userProfile?.full_name || 'Profile'}
                      </span>
                    </Button>
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {userProfile?.full_name || 'User'}
                        <div className="text-xs text-gray-500">
                          {userProfile?.role || 'client'}
                        </div>
                      </div>
                      {userProfile?.role === 'admin' && (
                        <button
                          onClick={() => navigate('/admin-dashboard')}
                          className="block w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-gray-100 font-medium"
                        >
                          <Icon name="Shield" size={16} className="inline mr-2" />
                          Admin Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/my-tickets')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Icon name="Ticket" size={16} className="inline mr-2" />
                        My Tickets
                      </button>
                      <button
                        onClick={() => navigate('/user-profile-management')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings size={16} className="inline mr-2" />
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button
                onClick={() => navigate('/login-register')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Support Ticket Form */}
      <SupportTicketForm
        isOpen={showSupportForm}
        onClose={() => setShowSupportForm(false)}
        onSuccess={() => {
          const viewTickets = window.confirm(
            'Support ticket submitted successfully! We will get back to you soon.\n\nWould you like to view your tickets?'
          );
          if (viewTickets) {
            navigate('/my-tickets');
          }
        }}
      />
    </header>
  );
};

export default Header;