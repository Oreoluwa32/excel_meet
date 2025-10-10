import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import ProfessionalSection from './components/ProfessionalSection';
import SubscriptionSection from './components/SubscriptionSection';
import AccountSettingsSection from './components/AccountSettingsSection';
import SocialLinksSection from './components/SocialLinksSection';
import JobHistorySection from './components/JobHistorySection';
import PaymentMethodsSection from './components/PaymentMethodsSection';
import { useNavigate } from 'react-router-dom';

const UserProfileManagement = () => {
  const { user, userProfile, loading, updateProfile, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [savingData, setSavingData] = useState(false);

  // Handle saving various profile sections
  const handleSaveProfileData = async (section, data) => {
    setSavingData(true);
    try {
      if (section === 'password') {
        // Handle password update
        const result = await updatePassword(data.newPassword);
        if (result?.success) {
          alert('Password updated successfully');
        } else {
          alert(result?.error || 'Failed to update password');
        }
      } else {
        // Handle other profile updates
        const updates = { [section]: data };
        const result = await updateProfile(updates);
        if (result?.success) {
          console.log(`${section} updated successfully`);
        } else {
          alert(result?.error || `Failed to update ${section}`);
        }
      }
    } catch (error) {
      console.error('Error saving profile data:', error);
      alert('An error occurred while saving');
    } finally {
      setSavingData(false);
    }
  };

  // Handle viewing job details
  const handleViewJob = (jobId) => {
    navigate(`/job-details?id=${jobId}`);
  };

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

  // Prepare user data for components
  const userData = {
    name: userProfile?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'User')}&background=3b82f6&color=fff`,
    location: userProfile?.location || 'Not specified',
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently',
    isVerified: userProfile?.is_verified || false,
    isProfessional: userProfile?.role === 'professional',
    rating: userProfile?.rating || 0,
    reviewCount: userProfile?.review_count || 0,
    completedJobs: userProfile?.completed_jobs || 0,
    skills: userProfile?.skills || [],
    portfolio: userProfile?.portfolio || [],
    serviceCategories: userProfile?.service_categories || [],
    primaryCategory: userProfile?.service_categories?.[0] || '',
    verificationStatus: userProfile?.verification_status || 'not_verified',
    settings: userProfile?.settings || {},
    paymentMethods: userProfile?.payment_methods || [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profile" showBack={true} />
      
      <main className="pb-20 lg:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Profile Header */}
            <ProfileHeader 
              user={userData} 
              onEditProfile={() => console.log('Edit profile clicked')} 
            />

            {/* Personal Information */}
            <PersonalInfoSection userProfile={userProfile} />

            {/* Social Links & Resume Section */}
            <SocialLinksSection />

            {/* Professional Information (available to all users) */}
            <ProfessionalSection 
              user={userData} 
              onSave={handleSaveProfileData} 
            />

            {/* Job History */}
            <JobHistorySection 
              user={userData} 
              onViewJob={handleViewJob} 
            />

            {/* Subscription Section */}
            <SubscriptionSection userProfile={userProfile} />

            {/* Payment Methods */}
            <PaymentMethodsSection 
              user={userData} 
              onSave={handleSaveProfileData} 
            />

            {/* Account Settings */}
            <AccountSettingsSection 
              user={userData} 
              onSave={handleSaveProfileData} 
            />

            {/* Logout Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={async () => {
                  const result = await signOut();
                  if (result?.success) {
                    navigate('/login-register');
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomTabNavigation />
    </div>
  );
};

export default UserProfileManagement;