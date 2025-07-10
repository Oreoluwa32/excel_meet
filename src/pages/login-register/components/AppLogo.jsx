import React from 'react';
import Icon from '../../../components/AppIcon';

const AppLogo = () => {
  return (
    <div className="flex flex-col items-center space-y-4 mb-8">
      {/* Logo Icon */}
      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
        <Icon name="Briefcase" size={32} color="white" strokeWidth={2} />
      </div>
      
      {/* App Name */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Excel-meet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with trusted professionals
        </p>
      </div>
    </div>
  );
};

export default AppLogo;