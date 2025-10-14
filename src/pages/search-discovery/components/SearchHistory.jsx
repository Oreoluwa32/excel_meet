import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { 
  getRecentSearches, 
  getTrendingSearches, 
  getPopularCategories,
  clearSearchHistory 
} from '../../../utils/searchService';
import { CATEGORY_ICONS } from '../../../utils/constants';

const SearchHistory = ({ onSearchSelect, activeTab }) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSearchData();
  }, [activeTab]);

  const loadSearchData = async () => {
    setIsLoading(true);
    try {
      // Load recent searches
      const { data: recent } = await getRecentSearches(activeTab, 5);
      setRecentSearches(recent || []);

      // Load trending searches
      const { data: trending } = await getTrendingSearches(activeTab, 8);
      setTrendingSearches(trending || []);

      // Load popular categories
      const { data: categories } = await getPopularCategories(6);
      setPopularCategories(categories || []);
    } catch (error) {
      console.error('Error loading search data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center">
              <Icon name="Clock" size={16} className="mr-2" />
              Recent Searches
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => onSearchSelect(search.search_query)}
                className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Search" size={16} className="text-muted-foreground" />
                  <div className="text-left">
                    <span className="text-foreground block">{search.search_query}</span>
                    <span className="text-xs text-muted-foreground">
                      {search.search_type === 'jobs' ? 'Jobs' : 'Professionals'}
                    </span>
                  </div>
                </div>
                <Icon name="ArrowUpRight" size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Searches */}
      {trendingSearches.length > 0 && (
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
                onClick={() => onSearchSelect(search.search_query)}
                className="justify-start text-left"
              >
                <span className="truncate">{search.search_query}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center">
            <Icon name="Grid3X3" size={16} className="mr-2" />
            Popular Categories
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {popularCategories.map((category, index) => {
              const totalCount = Number(category.job_count) + Number(category.professional_count);
              const jobCount = Number(category.job_count);
              const profCount = Number(category.professional_count);
              
              return (
                <button
                  key={index}
                  onClick={() => onSearchSelect(category.category)}
                  className="p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon 
                      name={CATEGORY_ICONS[category.category] || 'Briefcase'} 
                      size={16} 
                      className="text-primary" 
                    />
                    <span className="font-medium text-foreground text-sm truncate">
                      {category.category}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {jobCount > 0 && `${jobCount} job${jobCount !== 1 ? 's' : ''}`}
                    {jobCount > 0 && profCount > 0 && ' • '}
                    {profCount > 0 && `${profCount} pro${profCount !== 1 ? 's' : ''}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentSearches.length === 0 && trendingSearches.length === 0 && popularCategories.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Start Searching</h3>
          <p className="text-muted-foreground">
            Search for jobs or professionals to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchHistory;