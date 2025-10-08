import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import JobFeed from './components/JobFeed';
import SubscriptionBanner from './components/SubscriptionBanner';
import FilterChips from './components/FilterChips';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import CreateJobModal from './components/CreateJobModal';
import { Plus } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const HomeDashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    urgency: '',
    location: ''
  });
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  // Handle job creation
  const handleCreateJob = async (jobData) => {
    try {
      console.log('Creating job with data:', jobData);

      // TODO: Upload images to Supabase Storage
      // const imageUrls = await uploadJobImages(jobData.images);

      // Prepare job data for database
      const jobRecord = {
        user_id: user.id,
        title: jobData.title,
        category: jobData.category,
        description: jobData.description,
        budget_min: parseFloat(jobData.budget_min),
        budget_max: jobData.budget_max ? parseFloat(jobData.budget_max) : null,
        budget_type: jobData.budget_type,
        urgency: jobData.urgency,
        state: jobData.state,
        city: jobData.city,
        address: jobData.address || null,
        start_date: jobData.start_date,
        duration: jobData.duration || null,
        duration_unit: jobData.duration_unit,
        skills_required: jobData.skills_required,
        requirements: jobData.requirements || null,
        status: 'open',
        // images: imageUrls, // Add when image upload is implemented
        created_at: new Date().toISOString()
      };

      // Insert job into database
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobRecord])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Job created successfully:', data);

      // Show success message
      alert('Job posted successfully! Professionals in your area will be notified.');

      // Refresh the job feed (you might want to implement a refresh mechanism)
      window.location.reload();
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
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
            setIsCreateJobModalOpen(true);
          } else {
            window.location.href = '/login-register';
          }
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus size={24} />
      </FloatingActionButton>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onSubmit={handleCreateJob}
      />

      <BottomTabNavigation />
    </div>
  );
};

export default HomeDashboard;