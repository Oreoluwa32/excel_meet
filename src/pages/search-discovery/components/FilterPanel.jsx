import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import { JOB_CATEGORIES, RATING_OPTIONS, DISTANCE_OPTIONS, SORT_OPTIONS } from '../../../utils/constants';

const FilterPanel = ({ 
  filters, 
  setFilters, 
  isOpen, 
  onClose, 
  onApply, 
  onClear,
  activeTab 
}) => {
  const categories = JOB_CATEGORIES.map(cat => ({ value: cat, label: cat }));
  const locationOptions = DISTANCE_OPTIONS;
  const ratingOptions = RATING_OPTIONS;
  const sortOptions = activeTab === 'jobs' ? SORT_OPTIONS.JOBS : SORT_OPTIONS.PROFESSIONALS;

  const handleCategoryChange = (categoryValue, checked) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryValue]
        : prev.categories.filter(cat => cat !== categoryValue)
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort Options */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Sort by</h3>
        <Select
          options={sortOptions}
          value={filters.sortBy}
          onChange={(value) => handleFilterChange('sortBy', value)}
          placeholder="Select sorting"
        />
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <Checkbox
              key={category.value}
              label={category.label}
              checked={filters.categories.includes(category.value)}
              onChange={(e) => handleCategoryChange(category.value, e.target.checked)}
            />
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Distance</h3>
        <Select
          options={locationOptions}
          value={filters.distance}
          onChange={(value) => handleFilterChange('distance', value)}
          placeholder="Select distance"
        />
      </div>

      {/* Rating (for professionals) */}
      {activeTab === 'professionals' && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Minimum Rating</h3>
          <Select
            options={ratingOptions}
            value={filters.minRating}
            onChange={(value) => handleFilterChange('minRating', value)}
            placeholder="Select rating"
          />
        </div>
      )}

      {/* Verification Status */}
      {activeTab === 'professionals' && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Verification Status</h3>
          <Checkbox
            label="Verified professionals only"
            checked={filters.verifiedOnly}
            onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
          />
        </div>
      )}

      {/* Urgency (for jobs) */}
      {activeTab === 'jobs' && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Job Type</h3>
          <Checkbox
            label="Urgent jobs only"
            checked={filters.urgentOnly}
            onChange={(e) => handleFilterChange('urgentOnly', e.target.checked)}
          />
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={onClose}>
        <div 
          className="fixed bottom-0 left-0 right-0 bg-card rounded-t-lg max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)]">
            <FilterContent />
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-4 border-t border-border">
            <Button variant="outline" onClick={onClear} className="flex-1">
              Clear All
            </Button>
            <Button onClick={onApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-card border border-border rounded-lg p-6 h-fit sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        </div>
        
        <FilterContent />
        
        <div className="mt-6 pt-6 border-t border-border">
          <Button onClick={onApply} fullWidth>
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;