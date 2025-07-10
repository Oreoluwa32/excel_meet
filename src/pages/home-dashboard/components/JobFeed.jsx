import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';
import Icon from '../../../components/AppIcon';

const JobFeed = ({ filters, refreshTrigger }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      title: "Emergency Plumbing Repair - Kitchen Sink Leak",
      category: "Plumbing",
      location: "Downtown, Seattle",
      distance: "2.3 mi",
      timePeriod: "ASAP",
      urgency: "urgent",
      description: "Kitchen sink has a major leak under the cabinet. Water is pooling and needs immediate attention. Looking for licensed plumber available today.",
      budget: 150,
      budgetType: "fixed",
      postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      poster: {
        name: "Sarah Johnson",
        rating: 4.8,
        reviewCount: 23
      }
    },
    {
      id: 2,
      title: "House Cleaning Service - Weekly Recurring",
      category: "Cleaning",
      location: "Capitol Hill, Seattle",
      distance: "1.8 mi",
      timePeriod: "Weekly",
      urgency: "normal",
      description: "Looking for reliable house cleaning service for 3-bedroom home. Prefer eco-friendly products. Weekly recurring job with potential for long-term relationship.",
      budget: 120,
      budgetType: "per visit",
      postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      poster: {
        name: "Michael Chen",
        rating: 4.9,
        reviewCount: 45
      }
    },
    {
      id: 3,
      title: "Electrical Outlet Installation - Home Office",
      category: "Electrical",
      location: "Ballard, Seattle",
      distance: "3.1 mi",
      timePeriod: "This Week",
      urgency: "high",
      description: "Need 4 new electrical outlets installed in home office. Must be licensed electrician. Flexible on timing within this week.",
      budget: 300,
      budgetType: "fixed",
      postedDate: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      poster: {
        name: "David Rodriguez",
        rating: 4.7,
        reviewCount: 12
      }
    },
    {
      id: 4,
      title: "Furniture Assembly - IKEA Bedroom Set",
      category: "Repairs",
      location: "Queen Anne, Seattle",
      distance: "2.7 mi",
      timePeriod: "Weekend",
      urgency: "normal",
      description: "Need help assembling IKEA bedroom furniture set including bed frame, dresser, and nightstands. All tools will be provided.",
      budget: 80,
      budgetType: "fixed",
      postedDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      poster: {
        name: "Emily Watson",
        rating: 4.6,
        reviewCount: 8
      }
    },
    {
      id: 5,
      title: "Business Consulting - Marketing Strategy",
      category: "Consulting",
      location: "South Lake Union, Seattle",
      distance: "1.2 mi",
      timePeriod: "2 Weeks",
      urgency: "normal",
      description: "Small business owner seeking marketing consultant to develop digital marketing strategy. Experience with local businesses preferred.",
      budget: 500,
      budgetType: "project",
      postedDate: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      poster: {
        name: "Robert Kim",
        rating: 4.9,
        reviewCount: 67
      }
    },
    {
      id: 6,
      title: "Garden Landscaping - Backyard Makeover",
      category: "Landscaping",
      location: "Fremont, Seattle",
      distance: "4.2 mi",
      timePeriod: "Next Month",
      urgency: "normal",
      description: "Complete backyard landscaping project including lawn installation, flower beds, and small patio area. Looking for experienced landscaper.",
      budget: 2500,
      budgetType: "project",
      postedDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      poster: {
        name: "Lisa Thompson",
        rating: 4.8,
        reviewCount: 34
      }
    },
    {
      id: 7,
      title: "Interior Painting - Living Room & Kitchen",
      category: "Painting",
      location: "Wallingford, Seattle",
      distance: "2.9 mi",
      timePeriod: "Next Week",
      urgency: "high",
      description: "Need professional painter for living room and kitchen. Walls are prepped and ready. Paint will be provided. Looking for clean, quality work.",
      budget: 800,
      budgetType: "fixed",
      postedDate: new Date(Date.now() - 30 * 60 * 60 * 1000), // 1.25 days ago
      poster: {
        name: "James Wilson",
        rating: 4.7,
        reviewCount: 19
      }
    },
    {
      id: 8,
      title: "Moving Help - Apartment to House",
      category: "Moving",
      location: "Greenwood, Seattle",
      distance: "5.1 mi",
      timePeriod: "This Saturday",
      urgency: "urgent",
      description: "Need 2-3 people to help move from 2-bedroom apartment to house. Truck will be provided. Heavy lifting required. Saturday morning preferred.",
      budget: 200,
      budgetType: "total",
      postedDate: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
      poster: {
        name: "Amanda Davis",
        rating: 4.5,
        reviewCount: 6
      }
    }
  ];

  const filterJobs = (jobList, activeFilters) => {
    return jobList.filter(job => {
      // Ensure job object exists and has required properties
      if (!job) {
        return false;
      }
      
      if (activeFilters?.category && job?.category !== activeFilters.category) {
        return false;
      }
      if (activeFilters?.urgency && job?.urgency !== activeFilters.urgency) {
        return false;
      }
      return true;
    });
  };

  const loadJobs = async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const filteredJobs = filterJobs(mockJobs, filters || {});
    const startIndex = (pageNum - 1) * 4;
    const endIndex = startIndex + 4;
    const newJobs = filteredJobs.slice(startIndex, endIndex);

    if (isRefresh || pageNum === 1) {
      setJobs(newJobs);
    } else {
      setJobs(prev => [...prev, ...newJobs]);
    }

    setHasMore(endIndex < filteredJobs.length);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    setPage(1);
    loadJobs(1, true);
  }, [filters, refreshTrigger]);

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

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Search" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Try adjusting your filters or check back later for new opportunities.
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