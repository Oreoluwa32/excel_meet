import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const JobHistorySection = ({ postedJobs = [], activeJobs = [], completedJobs = [] }) => {
  const [activeTab, setActiveTab] = useState('completed');

  // Don't render if no jobs at all
  if (postedJobs.length === 0 && activeJobs.length === 0 && completedJobs.length === 0) {
    return null;
  }

  const tabs = [
    { id: 'completed', label: 'Completed Jobs', count: completedJobs.length, icon: 'CheckCircle' },
    { id: 'active', label: 'Active Jobs', count: activeJobs.length, icon: 'Clock' },
    { id: 'posted', label: 'Posted Jobs', count: postedJobs.length, icon: 'Briefcase' }
  ];

  const renderJobCard = (job, type) => {
    const budgetDisplay = job.budget_type === 'hourly' 
      ? `₦${job.budget_min}/hr${job.budget_max ? ` - ₦${job.budget_max}/hr` : ''}`
      : `₦${job.budget_min}${job.budget_max ? ` - ₦${job.budget_max}` : ''}`;

    const statusColors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <div key={job.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Job Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{job.title}</h4>
            <p className="text-sm text-muted-foreground">{job.category}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-gray-100 text-gray-800'}`}>
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Job Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {job.description}
        </p>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="DollarSign" size={16} className="text-primary" />
            <span className="text-foreground">{budgetDisplay}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="MapPin" size={16} className="text-primary" />
            <span className="text-foreground">{job.city}, {job.state}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-foreground">{new Date(job.start_date).toLocaleDateString()}</span>
          </div>
          {job.duration && (
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Clock" size={16} className="text-primary" />
              <span className="text-foreground">{job.duration} {job.duration_unit}</span>
            </div>
          )}
        </div>

        {/* Skills Required */}
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {job.skills_required.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {job.skills_required.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{job.skills_required.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Job Images */}
        {job.images && job.images.length > 0 && (
          <div className="mb-3">
            <div className="flex space-x-2 overflow-x-auto">
              {job.images.slice(0, 3).map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Job image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Additional Info for Posted Jobs */}
        {type === 'posted' && job.application_count !== undefined && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-3 border-t border-border">
            <Icon name="Users" size={16} />
            <span>{job.application_count} application{job.application_count !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Additional Info for Active/Completed Jobs */}
        {(type === 'active' || type === 'completed') && job.poster_name && (
          <div className="flex items-center space-x-2 pt-3 border-t border-border">
            <Image
              src={job.poster_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.poster_name)}&size=100`}
              alt={job.poster_name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{job.poster_name}</p>
              <p className="text-xs text-muted-foreground">Job Poster</p>
            </div>
          </div>
        )}

        {/* Date Posted */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
          {job.urgency && (
            <span className={`text-xs font-medium ${
              job.urgency === 'urgent' ? 'text-red-600' :
              job.urgency === 'high' ? 'text-orange-600' :
              'text-muted-foreground'
            }`}>
              {job.urgency.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background border-t border-border">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Briefcase" size={24} className="text-primary" />
          <h3 className="text-xl font-bold text-foreground">Job History</h3>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-background text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'completed' && (
            <>
              {completedJobs.length > 0 ? (
                completedJobs.map((job) => renderJobCard(job, 'completed'))
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No completed jobs yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'active' && (
            <>
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => renderJobCard(job, 'active'))
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active jobs at the moment</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'posted' && (
            <>
              {postedJobs.length > 0 ? (
                postedJobs.map((job) => renderJobCard(job, 'posted'))
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <Icon name="Briefcase" size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No jobs posted yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobHistorySection;