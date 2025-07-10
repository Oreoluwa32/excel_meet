import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactSection = ({ professional, onStartChat }) => {
  const handlePhoneCall = () => {
    if (professional.phone) {
      window.open(`tel:${professional.phone}`, '_self');
    }
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card px-4 lg:px-6 py-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Contact</h2>
      
      <div className="space-y-4">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={onStartChat}
            className="w-full"
            iconName="MessageCircle"
            iconPosition="left"
          >
            Start Chat
          </Button>
          
          {professional.phone && professional.isVerified && (
            <Button
              variant="outline"
              onClick={handlePhoneCall}
              className="w-full"
              iconName="Phone"
              iconPosition="left"
            >
              Call Now
            </Button>
          )}
        </div>
        
        {/* Social Links */}
        {professional.socialLinks && professional.socialLinks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Social Links
            </h3>
            <div className="flex items-center space-x-3">
              {professional.socialLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSocialClick(link.url)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name={link.platform} size={20} />
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Service Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {professional.completedJobs}
            </div>
            <div className="text-sm text-muted-foreground">
              Jobs Completed
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {professional.memberSince}
            </div>
            <div className="text-sm text-muted-foreground">
              Member Since
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;