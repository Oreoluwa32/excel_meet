import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import DetailViewModal from '../../components/ui/DetailViewModal';
import Button from '../../components/ui/Button';
import { fetchJobApplications, updateApplicationStatus } from '../../utils/applicationService';
import { fetchJobById, toggleAcceptingApplications } from '../../utils/jobService';
import { getOrCreateConversation } from '../../utils/messagingService';
import { useAuth } from '../../contexts/AuthContext';

const JobApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [togglingApplications, setTogglingApplications] = useState(false);

  // Support both location.state (from navigation) and URL query params (from notifications)
  const jobId = location.state?.jobId || searchParams.get('jobId');
  const jobTitle = location.state?.jobTitle || jobData?.title || 'Job';

  useEffect(() => {
    const loadApplications = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch job data
        const { data: job, error: jobError } = await fetchJobById(jobId);
        if (jobError) {
          throw jobError;
        }
        setJobData(job);

        // Fetch applications
        const { data, error: fetchError } = await fetchJobApplications(jobId);
        if (fetchError) {
          throw fetchError;
        }

        setApplications(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading applications:', err);
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [jobId]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(applicationId);
      const { error } = await updateApplicationStatus(applicationId, newStatus);

      if (error) {
        throw error;
      }

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      alert(`Application ${newStatus} successfully!`);
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewProfile = (applicantId) => {
    navigate('/professional-profile', { state: { userId: applicantId } });
  };

  const handleToggleApplications = async () => {
    if (!jobData) return;

    try {
      setTogglingApplications(true);
      const newStatus = !jobData.accepting_applications;
      
      const { error } = await toggleAcceptingApplications(jobId, newStatus);
      if (error) {
        throw error;
      }

      // Update local state
      setJobData(prev => ({
        ...prev,
        accepting_applications: newStatus
      }));

      alert(newStatus 
        ? 'Applications are now open for this job.' 
        : 'Applications are now closed for this job.'
      );
    } catch (err) {
      console.error('Error toggling applications:', err);
      alert('Failed to update application status. Please try again.');
    } finally {
      setTogglingApplications(false);
    }
  };

  const handleMessageApplicant = async (applicantId) => {
    if (!user || !jobData) return;

    try {
      console.log('🔵 Creating conversation...', {
        jobId: jobData.id,
        posterId: user.id,
        applicantId
      });

      // Get or create conversation between job poster and applicant
      const { data: conversationId, error } = await getOrCreateConversation(
        jobData.id,
        user.id,
        applicantId
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DetailViewModal isOpen={true} title={`Applications for ${jobTitle}`}>
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </DetailViewModal>
    );
  }

  if (error) {
    return (
      <DetailViewModal isOpen={true} title="Applications">
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Applications</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </DetailViewModal>
    );
  }

  return (
    <DetailViewModal isOpen={true} title={`Applications for ${jobTitle}`}>
      <div className="bg-background min-h-screen p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-foreground">Applications</h2>
              <span className="text-sm text-muted-foreground">
                {applications.length} {applications.length === 1 ? 'application' : 'applications'}
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              Review and manage applications for this job posting
            </p>
            
            {/* Application Status Toggle */}
            {jobData && (
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${jobData.accepting_applications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium text-foreground">
                      Applications {jobData.accepting_applications ? 'Open' : 'Closed'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {jobData.accepting_applications 
                        ? 'Professionals can apply to this job' 
                        : 'New applications are not being accepted'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={jobData.accepting_applications ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleToggleApplications}
                  disabled={togglingApplications}
                  iconName={jobData.accepting_applications ? 'Lock' : 'Unlock'}
                  iconPosition="left"
                >
                  {togglingApplications 
                    ? 'Updating...' 
                    : jobData.accepting_applications 
                      ? 'Close Applications' 
                      : 'Open Applications'}
                </Button>
              </div>
            )}
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground">
                When professionals apply to your job, their applications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Applicant Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {application.applicant?.avatar_url ? (
                          <img
                            src={application.applicant.avatar_url}
                            alt={application.applicant.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {application.applicant?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        {application.applicant?.verification_status === 'verified' && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {application.applicant?.full_name || 'Anonymous User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Applied {formatTimeAgo(application.created_at)}
                        </p>
                        {application.applicant?.experience_years && (
                          <p className="text-sm text-muted-foreground">
                            {application.applicant.experience_years} years experience
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>

                  {/* Applicant Bio */}
                  {application.applicant?.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {application.applicant.bio}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {application.applicant?.skills && application.applicant.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {application.applicant.skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.applicant.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{application.applicant.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Proposal */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Proposal:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.proposal}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(application.applicant_id)}
                      iconName="User"
                      iconPosition="left"
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessageApplicant(application.applicant_id)}
                      iconName="MessageCircle"
                      iconPosition="left"
                    >
                      Message
                    </Button>
                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, 'accepted')}
                          disabled={updatingStatus === application.id}
                          iconName="Check"
                          iconPosition="left"
                        >
                          {updatingStatus === application.id ? 'Updating...' : 'Accept'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          disabled={updatingStatus === application.id}
                          iconName="X"
                          iconPosition="left"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          {updatingStatus === application.id ? 'Updating...' : 'Reject'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DetailViewModal>
  );
};

export default JobApplications;