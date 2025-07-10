import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PosterInfo = ({ poster }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/professional-profile');
  };

  return (
    <div className="bg-card border-b border-border p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Posted by</h3>
      
      <div className="flex items-start space-x-4">
        <div className="relative">
          <Image
            src={poster.avatar}
            alt={poster.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          {poster.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={12} color="white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-foreground">{poster.name}</h4>
            {poster.isVerified && (
              <Icon name="BadgeCheck" size={16} className="text-primary" />
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center">
              <Icon name="Star" size={14} className="text-warning mr-1" />
              <span>{poster.rating}</span>
            </div>
            <span>{poster.jobsPosted} jobs posted</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Member since {poster.memberSince}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleViewProfile}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default PosterInfo;