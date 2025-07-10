import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const JobHistorySection = ({ user, onViewJob }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('completed');

  const jobHistory = {
    completed: [
      {
        id: 1,
        title: "Kitchen Plumbing Repair",
        client: "Sarah Johnson",
        clientAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
        completedDate: "2024-12-15",
        amount: "$150",
        rating: 5,
        review: "Excellent work! Fixed the issue quickly and professionally.",
        category: "Plumbing"
      },
      {
        id: 2,
        title: "Electrical Outlet Installation",
        client: "Mike Chen",
        clientAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
        completedDate: "2024-12-10",
        amount: "$85",
        rating: 4,
        review: "Good work, arrived on time and completed the job efficiently.",
        category: "Electrical"
      },
      {
        id: 3,
        title: "Bathroom Deep Cleaning",
        client: "Emma Wilson",
        clientAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
        completedDate: "2024-12-05",
        amount: "$120",
        rating: 5,
        review: "Amazing attention to detail. Bathroom looks brand new!",
        category: "Cleaning"
      }
    ],
    active: [
      {
        id: 4,
        title: "Living Room Painting",
        client: "David Brown",
        clientAvatar: "https://randomuser.me/api/portraits/men/38.jpg",
        startDate: "2024-12-20",
        status: "In Progress",
        amount: "$300",
        category: "Painting"
      }
    ],
    posted: user.isProfessional ? [] : [
      {
        id: 5,
        title: "Garden Landscaping",
        postedDate: "2024-12-18",
        status: "Open",
        applicants: 8,
        budget: "$500-800",
        category: "Landscaping"
      },
      {
        id: 6,
        title: "Roof Repair",
        postedDate: "2024-12-12",
        status: "Completed",
        professional: "John Martinez",
        amount: "$450",
        category: "Repairs"
      }
    ]
  };

  const tabs = [
    { id: 'completed', label: 'Completed', count: jobHistory.completed.length },
    { id: 'active', label: 'Active', count: jobHistory.active.length },
    ...(user.isProfessional ? [] : [{ id: 'posted', label: 'Posted', count: jobHistory.posted.length }])
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={14}
        className={i < rating ? "text-warning fill-current" : "text-muted-foreground"}
      />
    ));
  };

  const renderJobCard = (job, type) => (
    <div key={job.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h5 className="font-medium text-foreground mb-1">{job.title}</h5>
          <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
            {job.category}
          </span>
        </div>
        <span className="text-lg font-semibold text-foreground">
          {job.amount || job.budget}
        </span>
      </div>

      {type === 'completed' && (
        <>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={job.clientAvatar}
                alt={job.client}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{job.client}</p>
              <p className="text-xs text-muted-foreground">Completed on {job.completedDate}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <div className="flex space-x-1">
              {renderStars(job.rating)}
            </div>
            <span className="text-sm text-muted-foreground">({job.rating}/5)</span>
          </div>

          <p className="text-sm text-muted-foreground mb-3">"{job.review}"</p>
        </>
      )}

      {type === 'active' && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={job.clientAvatar}
                alt={job.client}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{job.client}</p>
              <p className="text-xs text-muted-foreground">Started on {job.startDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-warning rounded-full" />
            <span className="text-sm text-warning font-medium">{job.status}</span>
          </div>
        </div>
      )}

      {type === 'posted' && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Posted on {job.postedDate}</p>
            <span className={`px-2 py-1 text-xs rounded ${
              job.status === 'Open' ?'bg-success/10 text-success' :'bg-muted text-muted-foreground'
            }`}>
              {job.status}
            </span>
          </div>
          {job.applicants && (
            <p className="text-sm text-muted-foreground">{job.applicants} applicants</p>
          )}
          {job.professional && (
            <p className="text-sm text-foreground">Completed by {job.professional}</p>
          )}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewJob(job.id)}
        className="w-full"
      >
        View Details
      </Button>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name="History" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Job History</h3>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="space-y-4 mt-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-muted-foreground/20 text-xs px-1.5 py-0.5 rounded">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {jobHistory[activeTab]?.length > 0 ? (
                jobHistory[activeTab].map((job) => renderJobCard(job, activeTab))
              ) : (
                <div className="text-center py-8">
                  <Icon name="Briefcase" size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No {activeTab} jobs found
                  </p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {activeTab === 'completed' && jobHistory.completed.length > 0 && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Performance Summary</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {jobHistory.completed.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Jobs Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {(jobHistory.completed.reduce((sum, job) => sum + job.rating, 0) / jobHistory.completed.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      ${jobHistory.completed.reduce((sum, job) => sum + parseInt(job.amount.replace('$', '')), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobHistorySection;