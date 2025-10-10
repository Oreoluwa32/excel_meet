import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';
import Icon from '../../../components/AppIcon';
import { fetchJobs, subscribeToJobs, unsubscribeFromJobs } from '../../../utils/jobService';

const JobFeed = ({ filters, refreshTrigger }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const loadJobs = async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      // Fetch jobs from Supabase with filters
      const { data, error: fetchError, hasMore: moreAvailable } = await fetchJobs({
        category: filters?.category || null,
        urgency: filters?.urgency || null,
        state: filters?.state || null,
        city: filters?.city || null,
        page: pageNum,
        limit: 10
      });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to match the expected format
      const transformedJobs = data.map(job => ({
        id: job.id,
        title: job.title,
        category: job.category,
        location: `${job.city}, ${job.state}`,
        distance: null, // Can be calculated if user location is available
        timePeriod: formatTimePeriod(job.start_date, job.duration, job.duration_unit),
        urgency: job.urgency,
        description: job.description,
        budget: formatBudget(job.budget_min, job.budget_max),
        budgetType: job.budget_type,
        postedDate: new Date(job.created_at),
        poster: {
          name: 'User', // Will be populated when we join with user profiles
          rating: 0,
          reviewCount: 0
        },
        rawData: job // Keep original data for reference
      }));

      if (isRefresh || pageNum === 1) {
        setJobs(transformedJobs);
      } else {
        setJobs(prev => [...prev, ...transformedJobs]);
      }

      setHasMore(moreAvailable);
      setError(null);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs');
      
      // If it's the first load and there's an error, show empty state
      if (isRefresh || pageNum === 1) {
        setJobs([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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

  // Load jobs on mount and when filters change
  useEffect(() => {
    setPage(1);
    loadJobs(1, true);
  }, [filters, refreshTrigger]);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = subscribeToJobs((payload) => {
      console.log('Real-time job update:', payload);
      
      // Handle different event types
      if (payload.eventType === 'INSERT') {
        // Refresh the feed when a new job is posted
        loadJobs(1, true);
      } else if (payload.eventType === 'UPDATE') {
        // Update the specific job in the list
        setJobs(prev => prev.map(job => 
          job.id === payload.new.id 
            ? { ...job, rawData: payload.new }
            : job
        ));
      } else if (payload.eventType === 'DELETE') {
        // Remove the deleted job from the list
        setJobs(prev => prev.filter(job => job.id !== payload.old.id));
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromJobs(subscription);
    };
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadJobs(nextPage, false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loadingMore) {
      handleLoadMore();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        {[...Array(4)].map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="AlertCircle" size={24} className="text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Jobs</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-4">
          {error}
        </p>
        <button
          onClick={() => loadJobs(1, true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Search" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          {filters?.category || filters?.urgency 
            ? 'Try adjusting your filters to see more opportunities.'
            : 'Be the first to post a job! Click the + button to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="space-y-4 px-4 pb-20 lg:pb-6"
      onScroll={handleScroll}
    >
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

      {/* Load More */}
      {loadingMore && (
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <JobCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loadingMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors duration-200"
          >
            <Icon name="RefreshCw" size={16} />
            Load More Jobs
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && jobs.length > 0 && (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            You've reached the end of available jobs
          </p>
        </div>
      )}
    </div>
  );
};

export default JobFeed;