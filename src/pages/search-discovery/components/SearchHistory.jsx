import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SearchHistory = ({ onSearchSelect }) => {
  const recentSearches = [
    "Plumber near downtown",
    "Web developer React",
    "House cleaning service",
    "Electrician emergency"
  ];

  const trendingSearches = [
    "Home renovation",
    "Mobile app development",
    "Interior design consultation",
    "HVAC maintenance",
    "Graphic design services",
    "Landscaping design"
  ];

  return (
    <div className="space-y-6">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center">
            <Icon name="Clock" size={16} className="mr-2" />
            Recent Searches
          </h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => onSearchSelect(search)}
                className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Search" size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{search}</span>
                </div>
                <Icon name="ArrowUpRight" size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Searches */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center">
          <Icon name="TrendingUp" size={16} className="mr-2" />
          Trending Searches
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {trendingSearches.map((search, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSearchSelect(search)}
              className="justify-start text-left"
            >
              <span className="truncate">{search}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center">
          <Icon name="Grid3X3" size={16} className="mr-2" />
          Popular Categories
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'Plumbing', icon: 'Wrench', count: '245 jobs' },
            { name: 'Technology', icon: 'Code', count: '189 professionals' },
            { name: 'Cleaning', icon: 'Sparkles', count: '156 jobs' },
            { name: 'Design', icon: 'Palette', count: '134 professionals' },
            { name: 'Electrical', icon: 'Zap', count: '98 jobs' },
            { name: 'Carpentry', icon: 'Hammer', count: '87 professionals' }
          ].map((category, index) => (
            <button
              key={index}
              onClick={() => onSearchSelect(category.name)}
              className="p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon name={category.icon} size={16} className="text-primary" />
                <span className="font-medium text-foreground">{category.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{category.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;