import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate('/job-details', { state: { jobId: job.id } });
  };

  const handleExpressInterest = () => {
    console.log('Express interest clicked for job:', job.id);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Information Technology': 'bg-blue-100 text-blue-800',
      'Engineering': 'bg-indigo-100 text-indigo-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-green-100 text-green-800',
      'Finance and Accounting': 'bg-emerald-100 text-emerald-800',
      'Marketing and Advertising': 'bg-purple-100 text-purple-800',
      'Sales and Business Development': 'bg-pink-100 text-pink-800',
      'Human Resources': 'bg-orange-100 text-orange-800',
      'Customer Service': 'bg-cyan-100 text-cyan-800',
      'Administration and Office Support': 'bg-slate-100 text-slate-800',
      'Legal': 'bg-gray-100 text-gray-800',
      'Manufacturing and Production': 'bg-amber-100 text-amber-800',
      'Construction and Skilled Trades': 'bg-yellow-100 text-yellow-800',
      'Logistics and Supply Chain': 'bg-teal-100 text-teal-800',
      'Hospitality and Tourism': 'bg-rose-100 text-rose-800',
      'Creative Arts and Design': 'bg-fuchsia-100 text-fuchsia-800',
      'Media and Communications': 'bg-violet-100 text-violet-800',
      'Science and Research': 'bg-sky-100 text-sky-800',
      'Agriculture and Farming': 'bg-lime-100 text-lime-800',
      'Public Sector and Government': 'bg-stone-100 text-stone-800',
      'Nonprofit and Community Services': 'bg-green-100 text-green-800',
      'Real Estate and Property': 'bg-blue-100 text-blue-800',
      'Retail': 'bg-orange-100 text-orange-800',
      'Security and Law Enforcement': 'bg-red-100 text-red-800',
      'Transportation and Driving': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return <Icon name="AlertCircle" size={16} className="text-red-500" />;
      case 'high':
        return <Icon name="Clock" size={16} className="text-orange-500" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(job.category)}`}>
              {job.category}
            </span>
            {getUrgencyIcon(job.urgency)}
          </div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">
            {job.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground ml-2">
          <Icon name="MapPin" size={14} />
          <span className="text-sm">{job.distance}</span>
        </div>
      </div>

      {/* Location and Time */}
      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Icon name="MapPin" size={14} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Calendar" size={14} />
          <span>{job.timePeriod}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Budget and Posted Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            ₦{job.budget}
          </span>
          {job.budgetType && (
            <span className="text-sm text-muted-foreground">
              /{job.budgetType}
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatTimeAgo(job.postedDate)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="flex-1"
          iconName="Eye"
          iconPosition="left"
          iconSize={16}
        >
          View Details
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleExpressInterest}
          className="flex-1"
          iconName="Heart"
          iconPosition="left"
          iconSize={16}
        >
          Interested
        </Button>
      </div>
    </div>
  );
};

export default JobCard;