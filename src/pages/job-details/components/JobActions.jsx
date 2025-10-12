import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const JobActions = ({ 
  userType, 
  onAcceptJob, 
  onAskQuestion, 
  onEditJob, 
  onViewApplications,
  hasApplied = false,
  applicationStatus = null,
  isSubmitting = false
}) => {
  const [showProposal, setShowProposal] = useState(false);
  const [proposal, setProposal] = useState('');

  const handleAcceptClick = () => {
    setShowProposal(true);
  };

  const handleSubmitProposal = () => {
    if (proposal.trim()) {
      onAcceptJob(proposal);
      setShowProposal(false);
      setProposal('');
    }
  };

  // Get button text based on application status
  const getApplicationButtonText = () => {
    if (hasApplied) {
      if (applicationStatus === 'pending') return 'Proposal Submitted';
      if (applicationStatus === 'accepted') return 'Application Accepted';
      if (applicationStatus === 'rejected') return 'Application Rejected';
      if (applicationStatus === 'withdrawn') return 'Application Withdrawn';
      return 'Already Applied';
    }
    return 'Accept Job';
  };

  if (userType === 'poster') {
    return (
      <div className="bg-card border-t border-border p-4 lg:p-6">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onEditJob}
            className="flex-1"
            iconName="Edit"
            iconPosition="left"
          >
            Edit Job
          </Button>
          <Button
            variant="default"
            onClick={onViewApplications}
            className="flex-1"
            iconName="Users"
            iconPosition="left"
          >
            View Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-t border-border p-4 lg:p-6">
      {showProposal ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Proposal
            </label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Describe your approach, timeline, and why you're the right fit for this job..."
              className="w-full h-32 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowProposal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmitProposal}
              disabled={!proposal.trim()}
              className="flex-1"
            >
              Submit Proposal
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onAskQuestion}
            className="flex-1"
            iconName="MessageCircle"
            iconPosition="left"
          >
            Message
          </Button>
          <Button
            variant={hasApplied ? "outline" : "default"}
            onClick={handleAcceptClick}
            className="flex-1"
            iconName={hasApplied ? "CheckCircle" : "Check"}
            iconPosition="left"
            disabled={hasApplied || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : getApplicationButtonText()}
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobActions;