import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DetailViewModal from '../../components/ui/DetailViewModal';
import ProfileHeader from './components/ProfileHeader';
import SkillsSection from './components/SkillsSection';
import ServiceInfo from './components/ServiceInfo';
import AboutSection from './components/AboutSection';
import PortfolioSection from './components/PortfolioSection';
import ReviewsSection from './components/ReviewsSection';
import ContactSection from './components/ContactSection';
import JobHistorySection from './components/JobHistorySection';
import { 
  fetchUserProfileWithStats, 
  fetchUserJobStats,
  fetchUserPostedJobs,
  fetchProfessionalActiveJobs,
  fetchProfessionalCompletedJobs
} from '../../utils/userService';
import { fetchUserReviews } from '../../utils/reviewService';
import { getOrCreateConversation } from '../../utils/messagingService';
import { useAuth } from '../../contexts/AuthContext';

const ProfessionalProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [professionalData, setProfessionalData] = useState(null);
  const [error, setError] = useState(null);
  
  // Get userId and jobId from navigation state
  const userId = location.state?.userId;
  const jobId = location.state?.jobId;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        setError('No user ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch user profile with stats
        const profileResponse = await fetchUserProfileWithStats(userId);
        
        if (!profileResponse.success) {
          throw new Error(profileResponse.error || 'Failed to fetch profile');
        }

        const profile = profileResponse.data;
        
        // Fetch user reviews
        const reviewsResponse = await fetchUserReviews(userId);
        const reviews = reviewsResponse.success ? reviewsResponse.data : [];

        // Fetch job statistics
        const jobStatsResponse = await fetchUserJobStats(userId);
        const jobStats = jobStatsResponse.data || {};

        // Fetch job history
        const postedJobsResponse = await fetchUserPostedJobs(userId);
        const activeJobsResponse = await fetchProfessionalActiveJobs(userId);
        const completedJobsResponse = await fetchProfessionalCompletedJobs(userId);

        // Parse portfolio from JSONB
        let portfolioItems = [];
        if (profile.portfolio) {
          try {
            portfolioItems = typeof profile.portfolio === 'string' 
              ? JSON.parse(profile.portfolio) 
              : profile.portfolio;
          } catch (e) {
            console.error('Error parsing portfolio:', e);
            portfolioItems = [];
          }
        }

        // Transform data to match component expectations
        const transformedData = {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          title: profile.professional_title || profile.bio || 'Professional',
          location: [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not specified',
          avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=400`,
          isVerified: profile.verification_status === 'verified',
          isPremium: profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro',
          rating: profile.averageRating || 0,
          reviewCount: reviews.length,
          isAvailable: profile.availability_status === 'available',
          experience: profile.years_of_experience || 0,
          responseTime: profile.response_time || 'Not specified',
          phone: profile.phone_number || 'Not provided',
          completedJobs: jobStats.completedJobsAsProfessional || 0,
          jobsPosted: jobStats.jobsPosted || 0,
          memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : 'Recently',
          hourlyRate: {
            min: profile.hourly_rate_min || 0,
            max: profile.hourly_rate_max || 0
          },
          serviceCategories: profile.service_categories || [],
          skills: (profile.skills || []).map(skill => ({
            name: typeof skill === 'string' ? skill : skill.name,
            level: typeof skill === 'object' ? skill.level : 'Intermediate'
          })),
          about: profile.bio || 'No bio available',
          portfolio: portfolioItems,
          postedJobs: postedJobsResponse.data || [],
          activeJobs: activeJobsResponse.data || [],
          completedJobsList: completedJobsResponse.data || [],
          socialLinks: [
            profile.linkedin_url && { platform: "Linkedin", url: profile.linkedin_url },
            profile.instagram_url && { platform: "Instagram", url: profile.instagram_url },
            profile.facebook_url && { platform: "Facebook", url: profile.facebook_url }
          ].filter(Boolean),
          reviews: reviews.map(review => ({
            reviewerName: review.reviewer_name || 'Anonymous',
            reviewerAvatar: review.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name || 'User')}&size=100`,
            rating: review.rating,
            date: new Date(review.created_at).toISOString().split('T')[0],
            serviceType: review.job_title || 'Service',
            comment: review.comment,
            professionalResponse: review.professional_response || null
          }))
        };

        setProfessionalData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching professional profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleStartChat = async () => {
    if (!user || !professionalData) {
      alert('Please log in to start a chat.');
      return;
    }

    // Check if we have a jobId to associate with the conversation
    if (!jobId) {
      alert('Please navigate from a job posting to start a conversation about that job.');
      return;
    }

    try {
      console.log('🔵 Creating conversation...', {
        jobId,
        currentUserId: user.id,
        professionalId: professionalData.id
      });

      // Get or create conversation between current user and professional
      const { data: conversationId, error } = await getOrCreateConversation(
        jobId,
        user.id,
        professionalData.id
      );

      if (error) {
        throw error;
      }

      console.log('✅ Conversation created/retrieved:', conversationId);

      // Navigate to messages page with the conversation
      navigate('/messages', { state: { conversationId } });
    } catch (err) {
      console.error('❌ Error creating conversation:', err);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <DetailViewModal isOpen={true} onClose={handleClose} title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DetailViewModal>
    );
  }

  if (error || !professionalData) {
    return (
      <DetailViewModal isOpen={true} onClose={handleClose} title="Error">
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {error || 'Profile not found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Unable to load the professional profile. Please try again later.
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </DetailViewModal>
    );
  }

  return (
    <DetailViewModal 
      isOpen={true} 
      onClose={handleClose}
      title={professionalData.name}
    >
      <div className="bg-background min-h-screen">
        {/* Profile Header */}
        <ProfileHeader professional={professionalData} />
        
        {/* Skills Section */}
        <SkillsSection skills={professionalData.skills} />
        
        {/* Portfolio Section - Moved up to replace Service Categories */}
        <PortfolioSection portfolio={professionalData.portfolio} />
        
        {/* Service Information */}
        <ServiceInfo professional={professionalData} />
        
        {/* About Section */}
        <AboutSection about={professionalData.about} />
        
        {/* Job History Section */}
        <JobHistorySection 
          postedJobs={professionalData.postedJobs}
          activeJobs={professionalData.activeJobs}
          completedJobs={professionalData.completedJobsList}
        />
        
        {/* Reviews Section */}
        <ReviewsSection reviews={professionalData.reviews} />
        
        {/* Contact Section */}
        <ContactSection 
          professional={professionalData} 
          onStartChat={handleStartChat}
        />
        
        {/* Bottom Spacing for Mobile */}
        <div className="h-20 lg:h-6"></div>
      </div>
    </DetailViewModal>
  );
};

export default ProfessionalProfile;