import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import SearchBar from './components/SearchBar';
import SearchToggle from './components/SearchToggle';
import JobCard from './components/JobCard';
import ProfessionalCard from './components/ProfessionalCard';
import FilterPanel from './components/FilterPanel';
import SearchHistory from './components/SearchHistory';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import AdBanner from '../../components/AdBanner';
import { searchJobs, searchProfessionals, saveSearchHistory } from '../../utils/searchService';

const SearchDiscovery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState({
    categories: [],
    state: '',
    city: '',
    minRating: 'any',
    verifiedOnly: false,
    urgentOnly: false,
    sortBy: 'relevance'
  });

  // Perform search
  const performSearch = useCallback(async (page = 1) => {
    setIsLoading(true);
    
    try {
      if (activeTab === 'jobs') {
        const { data, error, hasMore: more, total } = await searchJobs({
          query: searchQuery,
          categories: filters.categories,
          state: filters.state,
          city: filters.city,
          urgentOnly: filters.urgentOnly,
          sortBy: filters.sortBy,
          page,
          limit: 20
        });

        if (error) {
          console.error('Error searching jobs:', error);
          setSearchResults([]);
          setTotalResults(0);
          setHasMore(false);
        } else {
          setSearchResults(data);
          setTotalResults(total);
          setHasMore(more);
          setCurrentPage(page);
          
          // Save search to history (only on first page)
          if (page === 1 && searchQuery.trim()) {
            saveSearchHistory({
              query: searchQuery,
              type: 'jobs',
              filters: filters,
              resultsCount: total
            });
          }
        }
      } else {
        const { data, error, hasMore: more, total } = await searchProfessionals({
          query: searchQuery,
          skills: filters.categories,
          state: filters.state,
          city: filters.city,
          minRating: filters.minRating !== 'any' ? parseFloat(filters.minRating) : null,
          verifiedOnly: filters.verifiedOnly,
          sortBy: filters.sortBy,
          page,
          limit: 20
        });

        if (error) {
          console.error('Error searching professionals:', error);
          setSearchResults([]);
          setTotalResults(0);
          setHasMore(false);
        } else {
          setSearchResults(data);
          setTotalResults(total);
          setHasMore(more);
          setCurrentPage(page);
          
          // Save search to history (only on first page)
          if (page === 1 && searchQuery.trim()) {
            saveSearchHistory({
              query: searchQuery,
              type: 'professionals',
              filters: filters,
              resultsCount: total
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in performSearch:', error);
      setSearchResults([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab, filters]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setHasSearched(true);
    setCurrentPage(1);
  };

  const handleSearchSelect = (query) => {
    handleSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      state: '',
      city: '',
      minRating: 'any',
      verifiedOnly: false,
      urgentOnly: false,
      sortBy: 'relevance'
    });
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    performSearch(currentPage + 1);
  };

  // Perform search when dependencies change
  useEffect(() => {
    if (hasSearched || searchQuery.trim()) {
      performSearch(1);
    }
  }, [searchQuery, activeTab, filters, hasSearched]);

  const showResults = hasSearched || searchQuery.trim();
  const hasResults = searchResults.length > 0;

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            iconName="ArrowLeft"
            iconPosition="left"
            className="text-muted-foreground hover:text-foreground"
          >
            Back
          </Button>
        </div>

        <div className="lg:flex lg:space-x-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              isOpen={true}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              activeTab={activeTab}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:min-w-0">
            {/* Search Header */}
            <div className="space-y-4 mb-6">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
              />
              
              <div className="flex items-center justify-between">
                <SearchToggle
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  iconName="Filter"
                  iconPosition="left"
                  className="lg:hidden"
                >
                  Filters
                </Button>
              </div>

              {/* Results Count */}
              {showResults && !isLoading && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {hasResults 
                      ? `${totalResults} ${activeTab} found`
                      : `No ${activeTab} found`
                    }
                    {searchQuery && ` for "${searchQuery}"`}
                  </span>
                  {hasResults && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(true)}
                      iconName="SlidersHorizontal"
                      iconPosition="left"
                      className="hidden lg:flex"
                    >
                      Sort & Filter
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {!showResults ? (
                // Search History & Trending
                <SearchHistory onSearchSelect={handleSearchSelect} activeTab={activeTab} />
              ) : isLoading ? (
                // Loading State
                <LoadingState type={activeTab} />
              ) : hasResults ? (
                <>
                  {/* Top Ad Banner */}
                  <AdBanner type="horizontal" />
                  
                  {/* Results Grid */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    {searchResults.map((item, index) => (
                      <React.Fragment key={item.id}>
                        {activeTab === 'jobs' ? (
                          <JobCard job={item} />
                        ) : (
                          <ProfessionalCard professional={item} />
                        )}
                        {/* Insert ad after every 4 results */}
                        {(index + 1) % 4 === 0 && index !== searchResults.length - 1 && (
                          <div className="lg:col-span-2">
                            <AdBanner type="horizontal" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                // Empty State
                <EmptyState
                  type={activeTab}
                  searchQuery={searchQuery}
                  onClearSearch={handleClearSearch}
                />
              )}

              {/* Load More Button */}
              {hasResults && !isLoading && hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    iconName="ChevronDown"
                    iconPosition="right"
                  >
                    Load More Results
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel */}
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeTab={activeTab}
      />
    </div>
  );
};

export default SearchDiscovery;