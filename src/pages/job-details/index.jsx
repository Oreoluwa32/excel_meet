import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DetailViewModal from '../../components/ui/DetailViewModal';
import JobHeader from './components/JobHeader';
import JobDescription from './components/JobDescription';
import JobLocation from './components/JobLocation';
import JobGallery from './components/JobGallery';
import PosterInfo from './components/PosterInfo';
import JobActions from './components/JobActions';
import ReviewsSection from './components/ReviewsSection';
import RelatedJobs from './components/RelatedJobs';
import CreateJobModal from '../home-dashboard/components/CreateJobModal';
import AdBanner from '../../components/AdBanner';
import { fetchJobById, saveJob, unsaveJob, isJobSaved, updateJob } from '../../utils/jobService';
import { fetchUserProfileWithStats } from '../../utils/userService';
import { fetchUserReviews } from '../../utils/reviewService';
import { submitApplication, checkUserApplication } from '../../utils/applicationService';
import { getOrCreateConversation } from '../../utils/messagingService';
import { useAuth } from '../../contexts/AuthContext';

const JobDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [userType, setUserType] = useState('professional'); // 'professional' or 'poster'
  const [posterData, setPosterData] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [loadingPoster, setLoadingPoster] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  // Get jobId from navigation state
  const jobId = location.state?.jobId;

  // Fetch job data on mount
  useEffect(() => {
    const loadJobData = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await fetchJobById(jobId);

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error('Job not found');
        }

        // Check if current user is the job poster
        if (user && data.user_id === user.id) {
          setUserType('poster');
        }

        setJobData(data);
        setError(null);

        // Check if job is saved by current user
        if (user && data.user_id !== user.id) {
          const { isSaved: savedStatus } = await isJobSaved(user.id, jobId);
          setIsSaved(savedStatus);
        }
      } catch (err) {
        console.error('Error loading job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    loadJobData();
  }, [jobId, user]);

  // Fetch poster profile data
  useEffect(() => {
    const loadPosterData = async () => {
      if (!jobData?.user_id) return;

      try {
        setLoadingPoster(true);
        const { data, error: fetchError } = await fetchUserProfileWithStats(jobData.user_id);

        if (fetchError) {
          console.error('Error fetching poster profile:', fetchError);
          return;
        }

        if (data) {
          // Transform to expected format
          const memberSince = data.created_at 
            ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recently';

          setPosterData({
            id: data.id,
            name: data.full_name || 'Anonymous User',
            avatar: data.avatar_url,
            rating: data.averageRating || 0,
            jobsPosted: data.jobsPosted || 0,
            memberSince: memberSince,
            isVerified: data.verification_status === 'verified'
          });
        }
      } catch (err) {
        console.error('Error loading poster data:', err);
      } finally {
        setLoadingPoster(false);
      }
    };

    loadPosterData();
  }, [jobData?.user_id]);

  // Fetch reviews for the poster
  useEffect(() => {
    const loadReviews = async () => {
      if (!jobData?.user_id) return;

      try {
        setLoadingReviews(true);
        const { data, error: fetchError } = await fetchUserReviews(jobData.user_id);

        if (fetchError) {
          console.error('Error fetching reviews:', fetchError);
          return;
        }

        if (data) {
          // Transform to expected format
          const transformedReviews = data.map(review => ({
            id: review.id,
            reviewer: {
              name: review.reviewer?.full_name || 'Anonymous',
              avatar: review.reviewer?.avatar_url
            },
            rating: review.rating,
            comment: review.comment,
            date: formatTimeAgo(review.created_at),
            serviceDate: review.service_date 
              ? new Date(review.service_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : null
          }));

          setReviewsData(transformedReviews);
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [jobData?.user_id]);

  // Check if user has already applied to this job
  useEffect(() => {
    const checkApplication = async () => {
      if (!user || !jobId || userType === 'poster') return;

      try {
        const { hasApplied: applied, application } = await checkUserApplication(user.id, jobId);
        setHasApplied(applied);
        setApplicationData(application);
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };

    checkApplication();
  }, [user, jobId, userType]);

  const relatedJobsData = [
    {
      id: 2,
      title: "Bathroom Tile Installation",
      category: "Home Improvement",
      location: "Lekki Phase 1, Lagos",
      postedDate: "1 day ago",
      isUrgent: false
    },
    {
      id: 3,
      title: "Deck Repair and Staining",
      category: "Outdoor Work",
      location: "Ikeja GRA, Lagos",
      postedDate: "3 days ago",
      isUrgent: true
    },
    {
      id: 4,
      title: "Interior Painting - 3 Bedrooms",
      category: "Painting",
      location: "Ikoyi, Lagos",
      postedDate: "5 days ago",
      isUrgent: false
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: jobData.title,
        text: `Check out this job opportunity: ${jobData.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = async () => {
    if (!user) {
      if (window.confirm('Please login to save jobs. Go to login page?')) {
        navigate('/login-register');
      }
      return;
    }

    if (!jobData) return;

    try {
      if (isSaved) {
        // Unsave the job
        const { error } = await unsaveJob(user.id, jobData.id);
        if (error) {
          throw error;
        }
        setIsSaved(false);
        alert('Job removed from saved jobs');
      } else {
        // Save the job
        const { error } = await saveJob(user.id, jobData.id);
        if (error) {
          throw error;
        }
        setIsSaved(true);
        
        // Show success message with option to view saved jobs
        if (window.confirm('Job saved successfully! Would you like to view all your saved jobs?')) {
          navigate('/saved-jobs');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      
      // Check if it's a duplicate error
      if (error.message && error.message.includes('duplicate')) {
        alert('This job is already saved');
        setIsSaved(true);
      } else {
        alert('Failed to save job. Please try again.');
      }
    }
  };

  const handleAcceptJob = async (proposal) => {
    if (!user) {
      if (window.confirm('Please login to apply for jobs. Go to login page?')) {
        navigate('/login-register');
      }
      return;
    }

    if (!jobData) return;

    try {
      setIsSubmittingApplication(true);
      const { data, error } = await submitApplication(jobData.id, user.id, proposal);

      if (error) {
        // Check if it's a duplicate application error
        if (error.message && error.message.includes('duplicate')) {
          alert('You have already applied to this job.');
          setHasApplied(true);
        } else {
          throw error;
        }
        return;
      }

      setHasApplied(true);
      setApplicationData(data);
      alert('Your proposal has been submitted successfully!');
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!user) {
      if (window.confirm('Please login to send messages. Go to login page?')) {
        navigate('/login-register');
      }
      return;
    }

    if (!jobData) return;

    try {
      // Get or create conversation
      const { data: conversationId, error } = await getOrCreateConversation(
        jobData.id,
        user.id,
        jobData.user_id
      );

      if (error) {
        throw error;
      }

      // Navigate to messages page with the conversation
      navigate('/messages', { state: { conversationId } });
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleEditJob = () => {
    setIsEditModalOpen(true);
  };

  const handleJobUpdate = async (updatedJobData) => {
    try {
      // Prepare job data for database (similar to create)
      const jobRecord = {
        title: updatedJobData.title,
        category: updatedJobData.category,
        description: updatedJobData.description,
        budget_min: parseFloat(updatedJobData.budget_min),
        budget_max: updatedJobData.budget_max ? parseFloat(updatedJobData.budget_max) : null,
        budget_type: updatedJobData.budget_type,
        urgency: updatedJobData.urgency,
        state: updatedJobData.state,
        city: updatedJobData.city,
        address: updatedJobData.address || null,
        start_date: updatedJobData.start_date,
        duration: updatedJobData.duration ? parseInt(updatedJobData.duration) : null,
        duration_unit: updatedJobData.duration_unit,
        skills_required: updatedJobData.skills_required,
        requirements: updatedJobData.requirements || null,
      };

      const { data, error: updateError } = await updateJob(jobData.id, jobRecord);

      if (updateError) {
        throw updateError;
      }

      // Refresh job data
      const { data: refreshedData, error: fetchError } = await fetchJobById(jobId);
      if (!fetchError && refreshedData) {
        setJobData(refreshedData);
      }

      setIsEditModalOpen(false);
      alert('Job updated successfully!');
    } catch (err) {
      console.error('Error updating job:', err);
      alert('Failed to update job. Please try again.');
    }
  };

  const handleViewApplications = () => {
    // Navigate to applications page with job ID
    navigate('/job-applications', { state: { jobId: jobData.id, jobTitle: jobData.title } });
  };

  // Helper function to format time period
  const formatTimePeriod = (startDate, duration, durationUnit) => {
    if (!startDate) return 'Flexible';
    
    const start = new Date(startDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = start.toLocaleDateString('en-US', options);
    
    if (duration && durationUnit) {
      return `${duration} ${durationUnit}${duration > 1 ? 's' : ''} starting ${formattedDate}`;
    }
    
    return `Starting ${formattedDate}`;
  };

  // Helper function to format budget
  const formatBudget = (min, max) => {
    if (!min) return 'Negotiable';
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-NG').format(num);
    };

    if (max && max !== min) {
      return `₦${formatNumber(min)} - ₦${formatNumber(max)}`;
    }
    
    return `₦${formatNumber(min)}`;
  };

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  // Transform database job data to component format
  const transformedJobData = jobData ? {
    id: jobData.id,
    title: jobData.title,
    category: jobData.category,
    postedDate: formatTimeAgo(jobData.created_at),
    location: `${jobData.city}, ${jobData.state}`,
    coordinates: jobData.latitude && jobData.longitude 
      ? { lat: jobData.latitude, lng: jobData.longitude }
      : null,
    timePeriod: formatTimePeriod(jobData.start_date, jobData.duration, jobData.duration_unit),
    isUrgent: jobData.urgency === 'urgent',
    description: jobData.description,
    requirements: [
      ...(jobData.skills_required || []),
      ...(typeof jobData.requirements === 'string' 
        ? jobData.requirements.split('\n').filter(r => r.trim())
        : (Array.isArray(jobData.requirements) ? jobData.requirements : []))
    ],
    images: jobData.images || [],
    budget: formatBudget(jobData.budget_min, jobData.budget_max),
    isPremium: false // Can be determined based on user subscription
  } : null;

  // Loading state
  if (loading) {
    return (
      <DetailViewModal isOpen={true} title="Job Details">
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </DetailViewModal>
    );
  }

  // Error state
  if (error || !transformedJobData) {
    return (
      <DetailViewModal isOpen={true} title="Job Details">
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Job</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'Job not found'}
            </p>
            <button
              onClick={() => navigate('/home-dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </DetailViewModal>
    );
  }

  return (
    <DetailViewModal isOpen={true} title="Job Details">
      <div className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto lg:flex lg:space-x-6">
          {/* Main Content */}
          <div className="flex-1">
            <JobHeader
              job={transformedJobData}
              onShare={handleShare}
              onSave={handleSave}
              isSaved={isSaved}
            />

            <JobDescription
              description={transformedJobData.description}
              requirements={transformedJobData.requirements}
            />

            {transformedJobData.coordinates && (
              <JobLocation
                location={transformedJobData.location}
                coordinates={transformedJobData.coordinates}
              />
            )}

            {transformedJobData.images && transformedJobData.images.length > 0 && (
              <JobGallery images={transformedJobData.images} />
            )}

            <PosterInfo poster={posterData} loading={loadingPoster} jobId={jobId} />

            {/* Ad Banner - Between sections */}
            <AdBanner type="horizontal" className="my-6" />

            <ReviewsSection reviews={reviewsData} loading={loadingReviews} />

            <JobActions
              userType={userType}
              onAcceptJob={handleAcceptJob}
              onAskQuestion={handleAskQuestion}
              onEditJob={handleEditJob}
              onViewApplications={handleViewApplications}
              hasApplied={hasApplied}
              applicationStatus={applicationData?.status}
              isSubmitting={isSubmittingApplication}
            />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              {/* Vertical Ad Banner */}
              <AdBanner type="vertical" />
              
              <RelatedJobs jobs={relatedJobsData} />
            </div>
          </div>
        </div>

        {/* Edit Job Modal */}
        {isEditModalOpen && jobData && (
          <CreateJobModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleJobUpdate}
            editMode={true}
            initialData={jobData}
          />
        )}
      </div>
    </DetailViewModal>
  );
};

export default JobDetails;