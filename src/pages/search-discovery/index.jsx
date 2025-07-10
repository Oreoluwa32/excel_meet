import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import Button from '../../components/ui/Button';
import SearchBar from './components/SearchBar';
import SearchToggle from './components/SearchToggle';
import JobCard from './components/JobCard';
import ProfessionalCard from './components/ProfessionalCard';
import FilterPanel from './components/FilterPanel';
import SearchHistory from './components/SearchHistory';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';

const SearchDiscovery = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState({
    categories: [],
    distance: 'any',
    minRating: 'any',
    availableNow: false,
    verifiedOnly: false,
    urgentOnly: false,
    sortBy: 'relevance'
  });

  // Mock data
  const mockJobs = [
    {
      id: 1,
      title: "Emergency Plumbing Repair Needed",
      category: "Plumbing",
      location: "Downtown Seattle, WA",
      postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      budget: "150-250",
      description: "Need urgent plumbing repair for kitchen sink leak. Water is dripping constantly and needs immediate attention.",
      posterName: "Sarah Johnson",
      urgent: true
    },
    {
      id: 2,
      title: "Website Development for Small Business",
      category: "Technology",
      location: "Bellevue, WA",
      postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      budget: "2000-3500",
      description: "Looking for a skilled web developer to create a modern, responsive website for our local bakery business.",
      posterName: "Mike Chen",
      urgent: false
    },
    {
      id: 3,
      title: "House Deep Cleaning Service",
      category: "Cleaning",
      location: "Capitol Hill, Seattle",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      budget: "200-300",
      description: "Need professional deep cleaning service for 3-bedroom house before family visit next week.",
      posterName: "Emily Rodriguez",
      urgent: false
    },
    {
      id: 4,
      title: "Custom Kitchen Cabinets Installation",
      category: "Carpentry",
      location: "Redmond, WA",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      budget: "1500-2500",
      description: "Looking for experienced carpenter to install custom kitchen cabinets. Materials already purchased.",
      posterName: "David Wilson",
      urgent: false
    },
    {
      id: 5,
      title: "Electrical Outlet Installation",
      category: "Electrical",
      location: "Kirkland, WA",
      postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      budget: "100-200",
      description: "Need licensed electrician to install 3 new outlets in home office. Safety is top priority.",
      posterName: "Lisa Thompson",
      urgent: true
    }
  ];

  const mockProfessionals = [
    {
      id: 1,
      name: "John Martinez",
      title: "Licensed Plumber",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      location: "Seattle, WA",
      rating: 4.9,
      reviewCount: 127,
      isVerified: true,
      isAvailable: true,
      skills: ["Emergency Repairs", "Pipe Installation", "Drain Cleaning", "Water Heaters"]
    },
    {
      id: 2,
      name: "Amanda Foster",
      title: "Full-Stack Developer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      location: "Bellevue, WA",
      rating: 4.8,
      reviewCount: 89,
      isVerified: true,
      isAvailable: true,
      skills: ["React", "Node.js", "MongoDB", "AWS", "UI/UX Design"]
    },
    {
      id: 3,
      name: "Carlos Rodriguez",
      title: "Professional Cleaner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      location: "Seattle, WA",
      rating: 4.7,
      reviewCount: 156,
      isVerified: false,
      isAvailable: false,
      skills: ["Deep Cleaning", "Move-in/out", "Office Cleaning", "Carpet Cleaning"]
    },
    {
      id: 4,
      name: "Robert Kim",
      title: "Master Carpenter",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      location: "Redmond, WA",
      rating: 5.0,
      reviewCount: 73,
      isVerified: true,
      isAvailable: true,
      skills: ["Custom Cabinets", "Furniture Repair", "Trim Work", "Flooring"]
    },
    {
      id: 5,
      name: "Jennifer Walsh",
      title: "Licensed Electrician",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      location: "Kirkland, WA",
      rating: 4.6,
      reviewCount: 94,
      isVerified: true,
      isAvailable: true,
      skills: ["Residential Wiring", "Panel Upgrades", "Smart Home", "Troubleshooting"]
    }
  ];

  const [filteredResults, setFilteredResults] = useState([]);

  // Filter and search logic
  const filterResults = useCallback(() => {
    const data = activeTab === 'jobs' ? mockJobs : mockProfessionals;
    let filtered = [...data];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (activeTab === 'jobs') {
          return item.title.toLowerCase().includes(query) ||
                 item.category.toLowerCase().includes(query) ||
                 item.location.toLowerCase().includes(query) ||
                 item.description.toLowerCase().includes(query);
        } else {
          return item.name.toLowerCase().includes(query) ||
                 item.title.toLowerCase().includes(query) ||
                 item.location.toLowerCase().includes(query) ||
                 item.skills.some(skill => skill.toLowerCase().includes(query));
        }
      });
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => {
        if (activeTab === 'jobs') {
          return filters.categories.includes(item.category.toLowerCase());
        } else {
          return item.skills.some(skill => 
            filters.categories.some(cat => skill.toLowerCase().includes(cat))
          );
        }
      });
    }

    // Professional-specific filters
    if (activeTab === 'professionals') {
      if (filters.minRating !== 'any') {
        const minRating = parseFloat(filters.minRating);
        filtered = filtered.filter(item => item.rating >= minRating);
      }

      if (filters.availableNow) {
        filtered = filtered.filter(item => item.isAvailable);
      }

      if (filters.verifiedOnly) {
        filtered = filtered.filter(item => item.isVerified);
      }
    }

    // Job-specific filters
    if (activeTab === 'jobs') {
      if (filters.urgentOnly) {
        filtered = filtered.filter(item => item.urgent);
      }
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.postedDate || 0) - new Date(a.postedDate || 0));
        break;
      case 'rating':
        if (activeTab === 'professionals') {
          filtered.sort((a, b) => b.rating - a.rating);
        }
        break;
      case 'distance':
        // Mock distance sorting - in real app would use actual coordinates
        filtered.sort((a, b) => a.location.localeCompare(b.location));
        break;
      default:
        // Keep default order for 'relevance'
        break;
    }

    setFilteredResults(filtered);
  }, [searchQuery, activeTab, filters, mockJobs, mockProfessionals]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setHasSearched(true);
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleSearchSelect = (query) => {
    handleSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setFilteredResults([]);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    setIsLoading(true);
    
    // Simulate filter application delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      distance: 'any',
      minRating: 'any',
      availableNow: false,
      verifiedOnly: false,
      urgentOnly: false,
      sortBy: 'relevance'
    });
  };

  // Apply filters when dependencies change
  useEffect(() => {
    if (hasSearched || searchQuery) {
      filterResults();
    }
  }, [filterResults, hasSearched, searchQuery]);

  // Handle tab change
  useEffect(() => {
    if (hasSearched) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [activeTab, hasSearched]);

  const showResults = hasSearched || searchQuery.trim();
  const hasResults = filteredResults.length > 0;

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-28 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
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
                      ? `${filteredResults.length} ${activeTab} found`
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
                <SearchHistory onSearchSelect={handleSearchSelect} />
              ) : isLoading ? (
                // Loading State
                <LoadingState type={activeTab} />
              ) : hasResults ? (
                // Results Grid
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredResults.map((item) => (
                    activeTab === 'jobs' ? (
                      <JobCard key={item.id} job={item} />
                    ) : (
                      <ProfessionalCard key={item.id} professional={item} />
                    )
                  ))}
                </div>
              ) : (
                // Empty State
                <EmptyState
                  type={activeTab}
                  searchQuery={searchQuery}
                  onClearSearch={handleClearSearch}
                />
              )}

              {/* Load More Button */}
              {hasResults && !isLoading && (
                <div className="flex justify-center pt-6">
                  <Button
                    variant="outline"
                    onClick={() => console.log('Load more results')}
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