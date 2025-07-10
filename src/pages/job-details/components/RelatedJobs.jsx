import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RelatedJobs = ({ jobs }) => {
  const navigate = useNavigate();

  if (!jobs || jobs.length === 0) {
    return null;
  }

  const handleJobClick = (jobId) => {
    // In a real app, this would navigate to the specific job
    navigate('/job-details');
  };

  return (
    <div className="hidden lg:block bg-card border-b border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Related Jobs</h3>
      
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleJobClick(job.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-foreground text-sm leading-tight">
                {job.title}
              </h4>
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                {job.postedDate}
              </span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Icon name="MapPin" size={12} className="mr-1" />
              <span>{job.location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                {job.category}
              </span>
              {job.isUrgent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">
                  <Icon name="Clock" size={10} className="mr-1" />
                  Urgent
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => navigate('/search-discovery')}
      >
        View More Jobs
      </Button>
    </div>
  );
};

export default RelatedJobs;