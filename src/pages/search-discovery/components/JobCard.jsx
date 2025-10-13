import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate('/job-details', { state: { jobId: job.id } });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return posted.toLocaleDateString();
  };

  const formatBudget = (min, max) => {
    if (!min) return 'Budget not specified';
    const formattedMin = min.toLocaleString();
    const formattedMax = max ? max.toLocaleString() : null;
    return formattedMax ? `₦${formattedMin} - ₦${formattedMax}` : `₦${formattedMin}`;
  };

  const location = [job.city, job.state].filter(Boolean).join(', ');
  const isUrgent = job.urgency === 'urgent';
  const posterName = job.user_profiles?.full_name || 'Anonymous';
  const posterAvatar = job.user_profiles?.avatar_url;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Icon name="Tag" size={14} />
            <span>{job.category}</span>
          </div>
        </div>
        {isUrgent && (
          <span className="bg-error/10 text-error text-xs px-2 py-1 rounded-full font-medium">
            Urgent
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {location && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{location}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={14} />
          <span>{getTimeAgo(job.created_at)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-foreground font-medium">
          <Icon name="DollarSign" size={14} />
          <span>{formatBudget(job.budget_min, job.budget_max)}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {posterAvatar ? (
            <img 
              src={posterAvatar} 
              alt={posterName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="User" size={14} color="white" />
            </div>
          )}
          <span className="text-sm text-muted-foreground">{posterName}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default JobCard;