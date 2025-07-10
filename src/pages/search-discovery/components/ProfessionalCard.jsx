import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfessionalCard = ({ professional }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/professional-profile', { state: { professionalId: professional.id } });
  };

  const handleChat = () => {
    console.log('Chat with professional:', professional.id);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={index < Math.floor(rating) ? 'text-warning fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
            <Image
              src={professional.avatar}
              alt={professional.name}
              className="w-full h-full object-cover"
            />
          </div>
          {professional.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={12} color="white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-foreground">{professional.name}</h3>
            {professional.isVerified && (
              <Icon name="BadgeCheck" size={16} className="text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{professional.title}</p>
          <div className="flex items-center space-x-1 mb-2">
            {renderStars(professional.rating)}
            <span className="text-sm text-muted-foreground ml-1">
              {professional.rating} ({professional.reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="MapPin" size={14} />
          <span>{professional.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Icon name="Clock" size={14} className="text-muted-foreground" />
          <span className={`text-sm ${professional.isAvailable ? 'text-success' : 'text-muted-foreground'}`}>
            {professional.isAvailable ? 'Available now' : 'Busy'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {professional.skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
        {professional.skills.length > 3 && (
          <span className="text-xs text-muted-foreground px-2 py-1">
            +{professional.skills.length - 3} more
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewProfile}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleChat}
          iconName="MessageCircle"
          iconPosition="left"
          iconSize={14}
        >
          Chat
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalCard;