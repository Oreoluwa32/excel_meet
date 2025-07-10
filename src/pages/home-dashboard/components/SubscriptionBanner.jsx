import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubscriptionBanner = ({ userType = 'free' }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || userType !== 'free') {
    return null;
  }

  const handleUpgrade = () => {
    console.log('Upgrade to premium clicked');
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 mx-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <Icon name="Crown" size={20} className="text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Unlock Premium Features
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Get unlimited job searches, priority support, and access to verified professionals
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="xs"
              onClick={handleUpgrade}
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={14}
            >
              Upgrade Now
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleDismiss}
              iconName="X"
              iconSize={14}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;