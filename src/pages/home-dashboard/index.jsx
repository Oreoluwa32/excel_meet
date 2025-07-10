import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import JobFeed from './components/JobFeed';
import SubscriptionBanner from './components/SubscriptionBanner';
import FilterChips from './components/FilterChips';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { Plus } from 'lucide-react';

const HomeDashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    urgency: '',
    location: ''
  });

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Excel-meet" />
      
      <main className="pb-20">
        {/* Welcome Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user ? `Welcome back, ${userProfile?.full_name || 'User'}!` : 'Welcome to Excel-meet'}
              </h1>
              <p className="text-gray-600">
                {user ? 'Find trusted professionals or post jobs in your area' : 'Connect with skilled professionals for your projects'}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Banner */}
        {user && userProfile?.subscription_plan === 'free' && (
          <SubscriptionBanner />
        )}

        {/* Filter Chips */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <FilterChips 
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Job Feed */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <JobFeed activeFilters={activeFilters} />
        </div>

        {/* Preview Mode Notice */}
        {!user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Preview Mode Active
              </h3>
              <p className="text-blue-700 mb-4">
                You are viewing Excel-meet in preview mode. Sign up to post jobs, connect with professionals, and unlock all features.
              </p>
              <button
                onClick={() => window.location.href = '/login-register'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          if (user) {
            // Handle job posting
            console.log('Post job clicked');
          } else {
            window.location.href = '/login-register';
          }
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus size={24} />
      </FloatingActionButton>

      <BottomTabNavigation />
    </div>
  );
};

export default HomeDashboard;