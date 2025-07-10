import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import ProfessionalSection from './components/ProfessionalSection';
import SubscriptionSection from './components/SubscriptionSection';
import AccountSettingsSection from './components/AccountSettingsSection';
import { useNavigate } from 'react-router-dom';

const UserProfileManagement = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Profile" showBack={true} showProfile={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Preview Mode - Profile Management
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to manage your profile, subscription, and account settings.
            </p>
            <button
              onClick={() => navigate('/login-register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profile" showBack={true} />
      
      <main className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Profile Header */}
            <ProfileHeader userProfile={userProfile} />

            {/* Personal Information */}
            <PersonalInfoSection userProfile={userProfile} />

            {/* Professional Information (for professionals) */}
            {userProfile?.role === 'professional' && (
              <ProfessionalSection userProfile={userProfile} />
            )}

            {/* Subscription Section */}
            <SubscriptionSection userProfile={userProfile} />

            {/* Account Settings */}
            <AccountSettingsSection />
          </div>
        </div>
      </main>

      <BottomTabNavigation />
    </div>
  );
};

export default UserProfileManagement;