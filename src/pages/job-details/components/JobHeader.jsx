import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobHeader = ({ job, onShare, onSave, isSaved }) => {
  return (
    <div className="bg-card border-b border-border p-4 lg:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2 leading-tight">
            {job.title}
          </h1>
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {job.category}
            </span>
            <span className="text-sm text-muted-foreground">
              Posted {job.postedDate}
            </span>
            {job.isUrgent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                <Icon name="Clock" size={12} className="mr-1" />
                Urgent
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="Share2" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className={isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
          >
            <Icon name={isSaved ? "Bookmark" : "BookmarkPlus"} size={20} />
          </Button>
        </div>
      </div>

      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <Icon name="MapPin" size={16} className="mr-2" />
        <span>{job.location}</span>
      </div>

      <div className="flex items-center text-sm text-muted-foreground">
        <Icon name="Calendar" size={16} className="mr-2" />
        <span>{job.timePeriod}</span>
      </div>
    </div>
  );
};

export default JobHeader;