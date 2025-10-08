import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DetailViewModal from '../../components/ui/DetailViewModal';
import JobHeader from './components/JobHeader';
import JobDescription from './components/JobDescription';
import JobLocation from './components/JobLocation';
import JobGallery from './components/JobGallery';
import PosterInfo from './components/PosterInfo';
import JobActions from './components/JobActions';
import ReviewsSection from './components/ReviewsSection';
import RelatedJobs from './components/RelatedJobs';

const JobDetails = () => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [userType] = useState('professional'); // 'professional' or 'poster'

  // Mock job data
  const jobData = {
    id: 1,
    title: "Professional Kitchen Renovation - Complete Remodel",
    category: "Home Improvement",
    postedDate: "2 days ago",
    location: "Victoria Island, Lagos",
    coordinates: { lat: 6.4281, lng: 3.4219 },
    timePeriod: "2-3 weeks starting January 15, 2025",
    isUrgent: true,
    description: `We're looking for an experienced contractor to completely renovate our kitchen. This is a full-scale remodel that includes:\n\n• Demolition of existing cabinets and countertops\n• Installation of new custom cabinets\n• Granite countertop installation\n• Plumbing work for new sink and dishwasher\n• Electrical work for updated lighting and outlets\n• Flooring installation (hardwood)\n• Painting and finishing work\n\nWe have all materials ready and permits in place. Looking for someone who can start immediately and complete the project within 3 weeks. Quality workmanship is essential as this is our forever home.`,
    requirements: [
      "Minimum 5 years experience in kitchen renovations",
      "Licensed and insured contractor",
      "References from recent similar projects",
      "Ability to work with custom cabinetry",
      "Knowledge of plumbing and electrical work",
      "Available to start within 1 week"
    ],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556909045-f7c5c2b4b2b0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
    ],
    budget: "₦6,000,000 - ₦10,000,000",
    isPremium: true
  };

  const posterData = {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    jobsPosted: 12,
    memberSince: "March 2022",
    isVerified: true
  };

  const reviewsData = [
    {
      id: 1,
      reviewer: {
        name: "Mike Rodriguez",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      rating: 5,
      comment: "Sarah was fantastic to work with. Clear communication, fair pricing, and the bathroom renovation turned out exactly as we envisioned. Highly recommend!",
      date: "2 weeks ago",
      serviceDate: "December 15, 2024"
    },
    {
      id: 2,
      reviewer: {
        name: "Jennifer Chen",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      rating: 5,
      comment: "Professional, punctual, and delivered exceptional results. The deck repair was completed ahead of schedule and within budget.",
      date: "1 month ago",
      serviceDate: "November 28, 2024"
    },
    {
      id: 3,
      reviewer: {
        name: "David Thompson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      rating: 4,
      comment: "Good work overall. The painting job was done well, though it took a bit longer than expected. Would work with Sarah again.",
      date: "2 months ago",
      serviceDate: "October 10, 2024"
    }
  ];

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

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleAcceptJob = (proposal) => {
    console.log('Job accepted with proposal:', proposal);
    alert('Your proposal has been submitted successfully!');
  };

  const handleAskQuestion = () => {
    console.log('Ask question clicked');
    alert('Chat feature will be available soon!');
  };

  const handleEditJob = () => {
    console.log('Edit job clicked');
    alert('Edit job functionality will be available soon!');
  };

  const handleViewApplications = () => {
    console.log('View applications clicked');
    alert('Applications view will be available soon!');
  };

  return (
    <DetailViewModal isOpen={true} title="Job Details">
      <div className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto lg:flex lg:space-x-6">
          {/* Main Content */}
          <div className="flex-1">
            <JobHeader
              job={jobData}
              onShare={handleShare}
              onSave={handleSave}
              isSaved={isSaved}
            />

            <JobDescription
              description={jobData.description}
              requirements={jobData.requirements}
            />

            <JobLocation
              location={jobData.location}
              coordinates={jobData.coordinates}
            />

            <JobGallery images={jobData.images} />

            <PosterInfo poster={posterData} />

            <ReviewsSection reviews={reviewsData} />

            <JobActions
              userType={userType}
              onAcceptJob={handleAcceptJob}
              onAskQuestion={handleAskQuestion}
              onEditJob={handleEditJob}
              onViewApplications={handleViewApplications}
            />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <RelatedJobs jobs={relatedJobsData} />
            </div>
          </div>
        </div>
      </div>
    </DetailViewModal>
  );
};

export default JobDetails;