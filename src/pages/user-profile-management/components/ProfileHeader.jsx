import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import AvatarUploadModal from './AvatarUploadModal';

const ProfileHeader = ({ user, onEditProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    if (onEditProfile) {
      onEditProfile();
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  return (
    <>
      <div className="bg-card border-b border-border p-6">
        <div className="flex flex-col items-center space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-primary/20">
              <Image
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-border"
              onClick={handleAvatarClick}
            >
              <Icon name="Camera" size={16} />
            </Button>
          </div>

        {/* Profile Info */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            {user.isVerified && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Check" size={14} color="white" />
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground mb-2">{user.email}</p>
          
          <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={16} />
              <span>{user.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={16} />
              <span>Joined {user.joinDate}</span>
            </div>
          </div>

          {user.isProfessional && (
            <div className="flex items-center justify-center lg:justify-start space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={16} className="text-warning fill-current" />
                <span className="font-medium">{user.rating}</span>
                <span className="text-muted-foreground">({user.reviewCount} reviews)</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {user.completedJobs} jobs completed
              </div>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <Button
          variant="outline"
          onClick={handleEditClick}
          className="lg:self-start"
        >
          <Icon name="Edit" size={16} className="mr-2" />
          Edit Profile
        </Button>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={user.avatar}
      />
    </>
  );
};

export default ProfileHeader;