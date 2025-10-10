import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceInfo = ({ professional }) => {
  return (
    <div className="bg-card border-b border-border px-4 lg:px-6 py-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Service Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Categories */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Service Categories
          </h3>
          <div className="space-y-1">
            {professional.serviceCategories.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={14} className="text-success" />
                <span className="text-sm text-foreground">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Service Rate
          </h3>
          <div className="text-2xl font-bold text-foreground">
            ₦{professional.hourlyRate.min.toLocaleString()} - ₦{professional.hourlyRate.max.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">/job</span>
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Experience
          </h3>
          <div className="text-lg font-semibold text-foreground">
            {professional.experience} years
          </div>
        </div>

        {/* Response Time */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Response Time
          </h3>
          <div className="text-lg font-semibold text-foreground">
            {professional.responseTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfo;