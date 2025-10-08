import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react';

const Header = ({ title, showBack = false, showProfile = true }) => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login-register');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
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
                {/* Notifications */}
                <Button variant="ghost" size="sm">
                  <Bell size={20} />
                </Button>

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
    </header>
  );
};

export default Header;