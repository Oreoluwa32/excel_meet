import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ProfileHeader = ({ professional }) => {
  return (
    <div className="bg-card border-b border-border">
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-32 lg:h-48 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        
        {/* Profile Content */}
        <div className="px-4 lg:px-6 pb-6">
          {/* Profile Photo */}
          <div className="relative -mt-16 lg:-mt-20 mb-4">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-card overflow-hidden bg-muted">
              <Image
                src={professional.avatar}
                alt={professional.name}
                className="w-full h-full object-cover"
              />
            </div>
            {professional.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                <Icon name="CheckCircle" size={16} color="white" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {professional.name}
                </h1>
                <p className="text-lg text-muted-foreground font-medium">
                  {professional.title}
                </p>
              </div>
              {professional.isPremium && (
                <div className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-medium">
                  Premium
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Icon name="MapPin" size={16} />
              <span className="text-sm">{professional.location}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={16}
                    className={i < Math.floor(professional.rating) ? 'text-warning fill-current' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                {professional.rating}
              </span>
              <span className="text-sm text-muted-foreground">
                ({professional.reviewCount} reviews)
              </span>
            </div>

            {/* Availability Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                professional.isAvailable ? 'bg-success' : 'bg-error'
              }`}></div>
              <span className={`text-sm font-medium ${
                professional.isAvailable ? 'text-success' : 'text-error'
              }`}>
                {professional.isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>

            {/* Job Statistics */}
            <div className="flex items-center space-x-6 pt-4 border-t border-border mt-4">
              <div className="flex items-center space-x-2">
                <Icon name="Briefcase" size={16} className="text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Jobs Posted</p>
                  <p className="text-sm font-semibold text-foreground">{professional.jobsPosted || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-sm font-semibold text-foreground">{professional.completedJobs || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;