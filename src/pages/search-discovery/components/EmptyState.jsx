import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ type, searchQuery, onClearSearch }) => {
  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: 'SearchX',
        title: `No ${type} found`,
        description: `We couldn't find any ${type} matching "${searchQuery}". Try adjusting your search terms or filters.`,
        action: {
          label: 'Clear Search',
          onClick: onClearSearch
        }
      };
    }

    return {
      icon: type === 'jobs' ? 'Briefcase' : 'Users',
      title: `Discover ${type === 'jobs' ? 'Job Opportunities' : 'Skilled Professionals'}`,
      description: type === 'jobs' ?'Start searching to find job opportunities that match your skills and location.' :'Find verified professionals in your area ready to help with your projects.',
      action: null
    };
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon name={content.icon} size={32} className="text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {content.title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {content.description}
      </p>

      {content.action && (
        <Button
          variant="outline"
          onClick={content.action.onClick}
          iconName="RotateCcw"
          iconPosition="left"
        >
          {content.action.label}
        </Button>
      )}

      {!searchQuery && (
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="Search" size={20} className="text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Search & Filter</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="MapPin" size={20} className="text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Location Based</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;