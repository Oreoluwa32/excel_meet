import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { 
  getProfessionalCompletedJobs, 
  getProfessionalActiveJobs,
  getUserPostedJobs 
} from '../../../utils/jobService';
import { fetchUserReviews } from '../../../utils/reviewService';

const JobHistorySection = ({ user, onViewJob }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('completed');
  const [loading, setLoading] = useState(false);
  const [jobHistory, setJobHistory] = useState({
    completed: [],
    active: [],
    posted: []
  });
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    if (isExpanded && user?.id) {
      loadJobHistory();
    }
  }, [isExpanded, user?.id]);

  const loadJobHistory = async () => {
    setLoading(true);
    try {
      // Fetch completed jobs (as professional)
      const { data: completedJobs } = await getProfessionalCompletedJobs(user.id);
      
      // Fetch active jobs (as professional)
      const { data: activeJobs } = await getProfessionalActiveJobs(user.id);
      
      // Fetch posted jobs (as client)
      const { data: postedJobs } = await getUserPostedJobs(user.id);

      // Fetch reviews for completed jobs
      const { data: userReviews } = await fetchUserReviews(user.id, 50);
      const reviewsMap = {};
      userReviews?.forEach(review => {
        if (review.job_id) {
          reviewsMap[review.job_id] = review;
        }
      });

      setJobHistory({
        completed: completedJobs || [],
        active: activeJobs || [],
        posted: user.isProfessional ? [] : (postedJobs || [])
      });
      setReviews(reviewsMap);
    } catch (error) {
      console.error('Error loading job history:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'completed', label: 'Completed', count: jobHistory.completed.length },
    { id: 'active', label: 'Active', count: jobHistory.active.length },
    ...(user.isProfessional ? [] : [{ id: 'posted', label: 'Posted', count: jobHistory.posted.length }])
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={14}
        className={i < rating ? "text-warning fill-current" : "text-muted-foreground"}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatBudget = (job) => {
    if (!job.budget_min && !job.budget_max) return 'N/A';
    if (job.budget_type === 'fixed') {
      return `₦${job.budget_min?.toLocaleString()}`;
    }
    return `₦${job.budget_min?.toLocaleString()} - ₦${job.budget_max?.toLocaleString()}`;
  };

  const renderJobCard = (job, type) => {
    const review = reviews[job.id];
    
    return (
      <div key={job.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h5 className="font-medium text-foreground mb-1">{job.title}</h5>
            <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
              {job.category}
            </span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            {formatBudget(job)}
          </span>
        </div>

        {type === 'completed' && (
          <>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                {job.poster_avatar ? (
                  <Image
                    src={job.poster_avatar}
                    alt={job.poster_name || 'Client'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Icon name="User" size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{job.poster_name || 'Client'}</p>
                <p className="text-xs text-muted-foreground">Completed on {formatDate(job.updated_at)}</p>
              </div>
            </div>

            {review && (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground mb-3">"{review.comment}"</p>
                )}
              </>
            )}
          </>
        )}

        {type === 'active' && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                {job.poster_avatar ? (
                  <Image
                    src={job.poster_avatar}
                    alt={job.poster_name || 'Client'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Icon name="User" size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{job.poster_name || 'Client'}</p>
                <p className="text-xs text-muted-foreground">Started on {formatDate(job.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span className="text-sm text-warning font-medium capitalize">{job.status?.replace('_', ' ')}</span>
            </div>
          </div>
        )}

        {type === 'posted' && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Posted on {formatDate(job.created_at)}</p>
              <span className={`px-2 py-1 text-xs rounded capitalize ${
                job.status === 'open' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {job.status?.replace('_', ' ')}
              </span>
            </div>
            {job.application_count !== undefined && (
              <p className="text-sm text-muted-foreground">{job.application_count} applicant{job.application_count !== 1 ? 's' : ''}</p>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewJob(job.id)}
          className="w-full"
        >
          View Details
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name="History" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Job History</h3>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="space-y-4 mt-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-muted-foreground/20 text-xs px-1.5 py-0.5 rounded">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-muted-foreground">Loading jobs...</p>
                </div>
              ) : jobHistory[activeTab]?.length > 0 ? (
                jobHistory[activeTab].map((job) => renderJobCard(job, activeTab))
              ) : (
                <div className="text-center py-8">
                  <Icon name="Briefcase" size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No {activeTab} jobs found
                  </p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {activeTab === 'completed' && jobHistory.completed.length > 0 && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Performance Summary</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {jobHistory.completed.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Jobs Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {(() => {
                        const reviewsWithRatings = jobHistory.completed
                          .map(job => reviews[job.id]?.rating)
                          .filter(rating => rating !== undefined);
                        if (reviewsWithRatings.length === 0) return 'N/A';
                        const avg = reviewsWithRatings.reduce((sum, rating) => sum + rating, 0) / reviewsWithRatings.length;
                        return avg.toFixed(1);
                      })()}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      ₦{jobHistory.completed.reduce((sum, job) => {
                        const amount = job.budget_type === 'fixed' ? job.budget_min : (job.budget_min + job.budget_max) / 2;
                        return sum + (amount || 0);
                      }, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobHistorySection;