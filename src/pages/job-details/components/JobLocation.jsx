import React from 'react';
import Icon from '../../../components/AppIcon';

const JobLocation = ({ location, coordinates }) => {
  return (
    <div className="bg-card border-b border-border p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Location</h3>
      
      <div className="flex items-center mb-4">
        <Icon name="MapPin" size={20} className="text-primary mr-3" />
        <span className="text-foreground font-medium">{location}</span>
      </div>

      <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title={location}
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=14&output=embed`}
          className="border-0"
        />
      </div>
    </div>
  );
};

export default JobLocation;