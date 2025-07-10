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

const ProfessionalProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Mock professional data
  const professionalData = {
    id: "prof_001",
    name: "Sarah Johnson",
    title: "Licensed Electrician & Home Automation Specialist",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    isVerified: true,
    isPremium: true,
    rating: 4.8,
    reviewCount: 127,
    isAvailable: true,
    experience: 8,
    responseTime: "Within 2 hours",
    phone: "+1 (555) 123-4567",
    completedJobs: 245,
    memberSince: "2019",
    hourlyRate: {
      min: 75,
      max: 120
    },
    serviceCategories: [
      "Electrical Installation",
      "Home Automation",
      "Smart Home Setup",
      "Electrical Repairs",
      "Panel Upgrades"
    ],
    skills: [
      { name: "Electrical Wiring", level: "Expert" },
      { name: "Smart Home Systems", level: "Advanced" },
      { name: "Solar Installation", level: "Intermediate" },
      { name: "Home Automation", level: "Expert" },
      { name: "Troubleshooting", level: "Expert" }
    ],
    about: `I'm a licensed electrician with over 8 years of experience specializing in residential electrical work and smart home automation. I hold certifications in electrical safety, smart home technology, and solar panel installation.

My passion lies in helping homeowners modernize their electrical systems while ensuring safety and efficiency. I've successfully completed over 245 projects, ranging from simple outlet installations to complete home automation systems.

I pride myself on clear communication, punctuality, and delivering high-quality work that exceeds expectations. Every project comes with a satisfaction guarantee and follow-up support.

When I'm not working, I enjoy staying updated with the latest smart home technologies and volunteering with local community electrical safety programs.`,
    portfolio: [
      {
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        title: "Smart Home Installation",
        description: "Complete home automation system with voice control"
      },
      {
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop",
        title: "Electrical Panel Upgrade",
        description: "200-amp panel upgrade with smart breakers"
      },
      {
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        title: "Outdoor Lighting",
        description: "Landscape lighting with smart controls"
      },
      {
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        title: "Kitchen Renovation",
        description: "Complete electrical rewiring for modern kitchen"
      }
    ],
    socialLinks: [
      { platform: "Linkedin", url: "https://linkedin.com/in/sarahjohnson" },
      { platform: "Instagram", url: "https://instagram.com/sarahelectrician" },
      { platform: "Facebook", url: "https://facebook.com/sarahjohnsonelectrical" }
    ],
    reviews: [
      {
        reviewerName: "Michael Chen",
        reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        rating: 5,
        date: "2024-06-15",
        serviceType: "Smart Home Installation",
        comment: "Sarah did an amazing job installing our smart home system. She was professional, knowledgeable, and explained everything clearly. The work was completed on time and within budget. Highly recommend!",
        professionalResponse: "Thank you Michael! It was a pleasure working on your smart home project. I'm glad you're enjoying the new automation features. Don't hesitate to reach out if you need any adjustments!"
      },
      {
        reviewerName: "Jennifer Martinez",reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",rating: 5,date: "2024-06-08",serviceType: "Electrical Panel Upgrade",comment: "Excellent work on our panel upgrade. Sarah was punctual, clean, and very thorough. She took the time to explain the new safety features and answered all our questions. Will definitely hire again.",professionalResponse: "Thanks Jennifer! Safety is always my top priority, and I'm happy you feel more secure with your new panel. The smart breakers will give you great control over your home's electrical system."
      },
      {
        reviewerName: "David Thompson",reviewerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",rating: 4,date: "2024-05-28",serviceType: "Electrical Repairs",comment: "Sarah quickly diagnosed and fixed our electrical issues. She was very professional and the pricing was fair. Only minor complaint was that she arrived about 15 minutes late, but she called ahead to let us know.",professionalResponse: "Thank you David! I apologize for the slight delay - traffic was heavier than expected. I always try to call ahead when running late. I\'m glad we got your electrical issues resolved quickly!"
      },
      {
        reviewerName: "Lisa Wang",
        reviewerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
        rating: 5,
        date: "2024-05-20",
        serviceType: "Outdoor Lighting",
        comment: "Beautiful outdoor lighting installation! Sarah helped us design the perfect lighting scheme for our garden and patio. The smart controls make it so convenient. Couldn't be happier with the results.",professionalResponse: "Thank you Lisa! Your garden looks absolutely stunning with the new lighting. I love how the smart scheduling automatically adjusts for the seasons. Enjoy your beautiful outdoor space!"
      },
      {
        reviewerName: "Robert Kim",reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",rating: 5,date: "2024-05-12",serviceType: "Kitchen Renovation",comment: "Sarah completely rewired our kitchen during renovation. Her attention to detail was impressive, and she coordinated perfectly with our contractor. The new electrical layout is exactly what we needed for our modern appliances."
      }
    ]
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleStartChat = () => {
    console.log('Starting chat with professional:', professionalData.name);
    // In a real app, this would navigate to chat or open chat modal
    alert(`Starting chat with ${professionalData.name}. This feature will be implemented in the chat system.`);
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
        
        {/* Service Information */}
        <ServiceInfo professional={professionalData} />
        
        {/* About Section */}
        <AboutSection about={professionalData.about} />
        
        {/* Portfolio Section */}
        <PortfolioSection portfolio={professionalData.portfolio} />
        
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