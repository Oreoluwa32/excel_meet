import React from 'react';
import Button from '../../../components/ui/Button';

const SearchToggle = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex bg-muted rounded-lg p-1">
      <Button
        variant={activeTab === 'jobs' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('jobs')}
        className="flex-1 rounded-md"
      >
        Jobs
      </Button>
      <Button
        variant={activeTab === 'professionals' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('professionals')}
        className="flex-1 rounded-md"
      >
        Professionals
      </Button>
    </div>
  );
};

export default SearchToggle;