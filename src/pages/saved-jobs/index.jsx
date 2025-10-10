import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import JobCard from '../home-dashboard/components/JobCard';
import JobCardSkeleton from '../home-dashboard/components/JobCardSkeleton';
import Icon from '../../components/AppIcon';
import { fetchSavedJobs } from '../../utils/jobService';

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load saved jobs on mount
  useEffect(() => {
    const loadSavedJobs = async () => {
      if (!user) {
        navigate('/login-register');
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await fetchSavedJobs(user.id);

        if (fetchError) {
          throw fetchError;
        }

        // Transform data to match JobCard format
        const transformedJobs = data.map(job => ({
          id: job.id,
          title: job.title,
          category: job.category,
          location: `${job.city}, ${job.state}`,
          distance: null,
          timePeriod: formatTimePeriod(job.start_date, job.duration, job.duration_unit),
          urgency: job.urgency,
          description: job.description,
          budget: formatBudget(job.budget_min, job.budget_max),
          budgetType: job.budget_type,
          postedDate: new Date(job.created_at),
          poster: {
            name: 'User',
            rating: 0,
            reviewCount: 0
          },
          rawData: job
        }));

        setJobs(transformedJobs);
        setError(null);
      } catch (err) {
        console.error('Error loading saved jobs:', err);
        setError(err.message || 'Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };

    loadSavedJobs();
  }, [user, navigate]);

  // Helper function to format time period
  const formatTimePeriod = (startDate, duration, durationUnit) => {
    if (!startDate) return 'Flexible';
    
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'ASAP';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 3) return 'This Week';
    if (diffDays <= 7) return 'Next Week';
    if (diffDays <= 14) return '2 Weeks';
    if (diffDays <= 30) return 'This Month';
    
    return 'Next Month';
  };

  // Helper function to format budget
  const formatBudget = (min, max) => {
    if (!min) return 'Negotiable';
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-NG').format(num);
    };

    if (max && max !== min) {
      return `${formatNumber(min)} - ${formatNumber(max)}`;
    }
    
    return formatNumber(min);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Saved Jobs" showBack />
        <main className="pb-20 px-4 pt-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Saved Jobs" showBack />
        <main className="pb-20 px-4 pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="AlertCircle" size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Saved Jobs</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Saved Jobs" showBack />
        <main className="pb-20 px-4 pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Icon name="Bookmark" size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Jobs</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              You haven't saved any jobs yet. Browse jobs and tap the bookmark icon to save them for later.
            </p>
            <button
              onClick={() => navigate('/home-dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Saved Jobs" showBack />
      
      <main className="pb-20 px-4 pt-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} saved
          </p>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Mobile Stack Layout */}
        <div className="lg:hidden space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>

      <BottomTabNavigation />
    </div>
  );
};

export default SavedJobs;