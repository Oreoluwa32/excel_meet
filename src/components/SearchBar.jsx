import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

/**
 * Reusable SearchBar component with debouncing
 */
const SearchBar = ({
  onSearch,
  placeholder = 'Search...',
  debounceDelay = 500,
  showClearButton = true,
  showFilterButton = false,
  onFilterClick,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  // Trigger search when debounced value changes
  useState(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {/* Search input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Clear button */}
        {showClearButton && searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter button */}
      {showFilterButton && (
        <button
          onClick={onFilterClick}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Open filters"
        >
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;