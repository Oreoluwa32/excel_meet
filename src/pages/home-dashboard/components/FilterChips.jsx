import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterChips = ({ activeFilters = {}, onFilterChange }) => {
  const categories = [
    'All',
    'Information Technology',
    'Engineering',
    'Healthcare',
    'Education',
    'Finance and Accounting',
    'Marketing and Advertising',
    'Sales and Business Development',
    'Human Resources',
    'Customer Service',
    'Administration and Office Support',
    'Legal',
    'Manufacturing and Production',
    'Construction and Skilled Trades',
    'Logistics and Supply Chain',
    'Hospitality and Tourism',
    'Creative Arts and Design',
    'Media and Communications',
    'Science and Research',
    'Agriculture and Farming',
    'Public Sector and Government',
    'Nonprofit and Community Services',
    'Real Estate and Property',
    'Retail',
    'Security and Law Enforcement',
    'Transportation and Driving'
  ];

  const urgencyLevels = [
    { value: 'all', label: 'All Priority', icon: 'Filter' },
    { value: 'urgent', label: 'Urgent', icon: 'AlertCircle' },
    { value: 'high', label: 'High', icon: 'Clock' },
    { value: 'normal', label: 'Normal', icon: 'Minus' }
  ];

  const handleCategoryFilter = (category) => {
    onFilterChange?.({
      ...activeFilters,
      category: category === 'All' ? '' : category
    });
  };

  const handleUrgencyFilter = (urgency) => {
    onFilterChange?.({
      ...activeFilters,
      urgency: urgency === 'all' ? '' : urgency
    });
  };

  const handleLocationFilter = () => {
    console.log('Location filter clicked');
  };

  const clearAllFilters = () => {
    onFilterChange?.({
      category: '',
      urgency: '',
      location: ''
    });
  };

  const hasActiveFilters = activeFilters?.category || activeFilters?.urgency || activeFilters?.location;

  return (
    <div className="bg-card border-b border-border">
      <div className="px-4 py-3">
        {/* Category Filters */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Tag" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Categories</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const isActive = activeFilters?.category === category || (category === 'All' && !activeFilters?.category);
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority and Location Filters */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide">
            {urgencyLevels.map((level) => {
              const isActive = activeFilters?.urgency === level.value || (level.value === 'all' && !activeFilters?.urgency);
              return (
                <button
                  key={level.value}
                  onClick={() => handleUrgencyFilter(level.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon name={level.icon} size={14} />
                  {level.label}
                </button>
              );
            })}
            
            {/* Location Filter */}
            <button
              onClick={handleLocationFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-muted text-muted-foreground hover:bg-muted/80 transition-colors duration-200"
            >
              <Icon name="MapPin" size={14} />
              Near Me
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Icon name="X" size={14} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterChips;