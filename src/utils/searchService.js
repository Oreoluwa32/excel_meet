import { supabase } from './supabase';

/**
 * Search Service
 * Handles all search-related operations for jobs and professionals
 */

/**
 * Search jobs with filters
 * @param {Object} options - Search options
 * @param {string} options.query - Search query string
 * @param {Array<string>} options.categories - Filter by categories
 * @param {string} options.urgency - Filter by urgency level
 * @param {string} options.state - Filter by state
 * @param {string} options.city - Filter by city
 * @param {number} options.minBudget - Minimum budget
 * @param {number} options.maxBudget - Maximum budget
 * @param {boolean} options.urgentOnly - Show only urgent jobs
 * @param {string} options.sortBy - Sort order (relevance, newest, budget_high, budget_low)
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<{data: Array, error: Error|null, hasMore: boolean, total: number}>}
 */
export const searchJobs = async (options = {}) => {
  try {
    const {
      query = '',
      categories = [],
      urgency = null,
      state = null,
      city = null,
      minBudget = null,
      maxBudget = null,
      urgentOnly = false,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = options;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build base query
    let queryBuilder = supabase
      .from('jobs')
      .select('*, user_profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'open');

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.trim();
      const words = searchTerm.split(/\s+/).filter(Boolean);
      
      // For more robust search, we use a single pattern with multiple wildcards
      // But we should quote the value to handle spaces and special characters in PostgREST
      const searchPattern = `"%${words.join('%')}%"`;
      
      queryBuilder = queryBuilder.or(
        `title.ilike.${searchPattern},description.ilike.${searchPattern},category.ilike.${searchPattern},city.ilike.${searchPattern},state.ilike.${searchPattern}`
      );
    }

    // Apply category filter
    if (categories.length > 0) {
      queryBuilder = queryBuilder.in('category', categories);
    }

    // Apply urgency filter
    if (urgency) {
      queryBuilder = queryBuilder.eq('urgency', urgency);
    }

    // Apply urgent only filter
    if (urgentOnly) {
      queryBuilder = queryBuilder.eq('urgency', 'urgent');
    }

    // Apply location filters
    if (state) {
      queryBuilder = queryBuilder.eq('state', state);
    }

    if (city) {
      queryBuilder = queryBuilder.eq('city', city);
    }

    // Apply budget filters
    if (minBudget !== null) {
      queryBuilder = queryBuilder.gte('budget_min', minBudget);
    }

    if (maxBudget !== null) {
      queryBuilder = queryBuilder.lte('budget_max', maxBudget);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
        break;
      case 'budget_high':
        queryBuilder = queryBuilder.order('budget_max', { ascending: false });
        break;
      case 'budget_low':
        queryBuilder = queryBuilder.order('budget_min', { ascending: true });
        break;
      case 'relevance':
      default:
        // For relevance, prioritize urgent jobs and recent posts
        // Note: urgency enum order is 'urgent', 'high', 'normal', 'low'
        queryBuilder = queryBuilder
          .order('urgency', { ascending: true })
          .order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Execute optimized search RPC
    const { data, error } = await supabase.rpc('search_jobs_optimized', {
      p_query: query || '',
      p_category: categories.length === 1 ? categories[0] : null,
      p_urgency: urgency,
      p_state: state,
      p_city: city,
      p_min_budget: minBudget,
      p_max_budget: maxBudget,
      p_page: page,
      p_limit: limit
    });

    if (error) {
      console.error('Error searching jobs (optimized):', error);
      return { data: [], error, hasMore: false, total: 0 };
    }

    const count = data.length > 0 ? data[0].total_count : 0;
    const hasMore = count > offset + limit;

    return { 
      data: data || [], 
      error: null, 
      hasMore,
      total: count
    };
  } catch (error) {
    console.error('Error in searchJobs:', error);
    return { data: [], error, hasMore: false, total: 0 };
  }
};

/**
 * Search professionals with filters
 * @param {Object} options - Search options
 * @param {string} options.query - Search query string
 * @param {Array<string>} options.skills - Filter by skills
 * @param {string} options.state - Filter by state
 * @param {string} options.city - Filter by city
 * @param {number} options.minRating - Minimum rating
 * @param {boolean} options.verifiedOnly - Show only verified professionals
 * @param {string} options.sortBy - Sort order (relevance, rating, newest)
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<{data: Array, error: Error|null, hasMore: boolean, total: number}>}
 */
export const searchProfessionals = async (options = {}) => {
  try {
    const {
      query = '',
      skills = [],
      state = null,
      city = null,
      minRating = null,
      verifiedOnly = false,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = options;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build base query - get professionals with their ratings
    let queryBuilder = supabase
      .from('user_profiles')
      .select(`
        *,
        reviews:reviews!reviewee_id(rating)
      `, { count: 'exact' })
      .eq('role', 'professional');

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.trim();
      const words = searchTerm.split(/\s+/).filter(Boolean);
      // Quote the pattern to handle spaces and special characters in PostgREST
      const searchPattern = `"%${words.join('%')}%"`;

      queryBuilder = queryBuilder.or(
        `full_name.ilike.${searchPattern},bio.ilike.${searchPattern},location.ilike.${searchPattern}`
      );
    }

    // Apply skills filter
    if (skills.length > 0) {
      // Search in both skills and service_categories arrays
      // Properly quote elements with spaces for Postgres array literal
      const formattedSkills = skills.map(skill => 
        skill.includes(' ') ? `"${skill}"` : skill
      );
      const skillsLiteral = `{${formattedSkills.join(',')}}`;
      queryBuilder = queryBuilder.or(`skills.ov.${skillsLiteral},service_categories.ov.${skillsLiteral}`);
    }

    // Apply location filters
    if (state || city) {
      const locationQuery = [state, city].filter(Boolean).join(', ');
      queryBuilder = queryBuilder.ilike('location', `%${locationQuery}%`);
    }

    // Apply verified filter
    if (verifiedOnly) {
      queryBuilder = queryBuilder.eq('verification_status', 'verified');
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
        break;
      case 'rating':
        // Note: We'll sort by rating after fetching since it's computed
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
        break;
      case 'relevance':
      default:
        queryBuilder = queryBuilder
          .order('verification_status', { ascending: false })
          .order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Execute optimized search RPC
    const { data, error } = await supabase.rpc('search_professionals_optimized', {
      p_query: query || '',
      p_skills: skills.length > 0 ? skills : null,
      p_location: [state, city].filter(Boolean).join(', ') || null,
      p_min_rating: minRating,
      p_verified_only: verifiedOnly,
      p_page: page,
      p_limit: limit
    });

    if (error) {
      console.error('Error searching professionals (optimized):', error);
      return { data: [], error, hasMore: false, total: 0 };
    }

    const count = data.length > 0 ? data[0].total_count : 0;
    const hasMore = count > offset + limit;

    return { 
      data: data || [], 
      error: null, 
      hasMore,
      total: count
    };
  } catch (error) {
    console.error('Error in searchProfessionals:', error);
    return { data: [], error, hasMore: false, total: 0 };
  }
};

/**
 * Get popular search queries (mock for now, can be enhanced with analytics)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getPopularSearches = async () => {
  try {
    // Get most common job categories
    const { data: jobCategories, error } = await supabase
      .from('jobs')
      .select('category')
      .eq('status', 'open')
      .limit(100);

    if (error) {
      console.error('Error fetching popular searches:', error);
      return { data: [], error };
    }

    // Count category occurrences
    const categoryCounts = {};
    jobCategories.forEach(job => {
      categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
    });

    // Sort by count and get top 10
    const popular = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, count]) => ({
        query: category,
        count
      }));

    return { data: popular, error: null };
  } catch (error) {
    console.error('Error in getPopularSearches:', error);
    return { data: [], error };
  }
};

/**
 * Get trending jobs (recently posted with high urgency)
 * @param {number} limit - Number of jobs to return
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getTrendingJobs = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, user_profiles!user_id(full_name, avatar_url)')
      .eq('status', 'open')
      .in('urgency', ['urgent', 'high'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getTrendingJobs:', error);
    return { data: [], error };
  }
};

/**
 * Get available job categories
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getJobCategories = async () => {
  try {
    // Use RPC for DISTINCT categories to avoid fetching all rows
    const { data, error } = await supabase.rpc('get_unique_job_categories');

    if (error) {
      console.error('Error fetching job categories:', error);
      return { data: [], error };
    }

    return { data: data.map(item => item.category), error: null };
  } catch (error) {
    console.error('Error in getJobCategories:', error);
    return { data: [], error };
  }
};

/**
 * Get available skills from professionals
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getAvailableSkills = async () => {
  try {
    // Use RPC for DISTINCT skills to avoid fetching all profiles
    const { data, error } = await supabase.rpc('get_unique_professional_skills');

    if (error) {
      console.error('Error fetching available skills:', error);
      return { data: [], error };
    }

    return { data: data.map(item => item.skill), error: null };
  } catch (error) {
    console.error('Error in getAvailableSkills:', error);
    return { data: [], error };
  }
};

/**
 * Get location suggestions (states and cities)
 * @returns {Promise<{data: Object, error: Error|null}>}
 */
export const getLocationSuggestions = async () => {
  try {
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('state, city')
      .eq('status', 'open');

    if (jobsError) {
      console.error('Error fetching location suggestions:', jobsError);
      return { data: { states: [], cities: [] }, error: jobsError };
    }

    // Get unique states and cities
    const states = [...new Set(jobs.map(job => job.state))].filter(Boolean).sort();
    const cities = [...new Set(jobs.map(job => job.city))].filter(Boolean).sort();

    return { 
      data: { states, cities }, 
      error: null 
    };
  } catch (error) {
    console.error('Error in getLocationSuggestions:', error);
    return { data: { states: [], cities: [] }, error };
  }
};

/**
 * Save search to history
 * @param {Object} searchData - Search data to save
 * @param {string} searchData.query - Search query
 * @param {string} searchData.type - Search type (jobs or professionals)
 * @param {Object} searchData.filters - Applied filters
 * @param {number} searchData.resultsCount - Number of results
 * @returns {Promise<{error: Error|null}>}
 */
export const saveSearchHistory = async (searchData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        search_query: searchData.query || '',
        search_type: searchData.type,
        filters: searchData.filters || {},
        results_count: searchData.resultsCount || 0
      });

    if (error) {
      console.error('Error saving search history:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in saveSearchHistory:', error);
    return { error };
  }
};

/**
 * Get user's recent searches
 * @param {string} searchType - Optional filter by search type
 * @param {number} limit - Number of results to return
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getRecentSearches = async (searchType = null, limit = 10) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .rpc('get_recent_searches', {
        p_user_id: user.id,
        p_search_type: searchType,
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching recent searches:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getRecentSearches:', error);
    return { data: [], error };
  }
};

/**
 * Get trending searches
 * @param {string} searchType - Optional filter by search type
 * @param {number} limit - Number of results to return
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getTrendingSearches = async (searchType = null, limit = 10) => {
  try {
    const { data, error } = await supabase
      .rpc('get_trending_searches', {
        p_search_type: searchType,
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching trending searches:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getTrendingSearches:', error);
    return { data: [], error };
  }
};

/**
 * Get popular categories
 * @param {number} limit - Number of results to return
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getPopularCategories = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .rpc('get_popular_categories', {
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching popular categories:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getPopularCategories:', error);
    return { data: [], error };
  }
};

/**
 * Clear user's search history
 * @returns {Promise<{error: Error|null}>}
 */
export const clearSearchHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing search history:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in clearSearchHistory:', error);
    return { error };
  }
};

export default {
  searchJobs,
  searchProfessionals,
  getPopularSearches,
  getTrendingJobs,
  getJobCategories,
  getAvailableSkills,
  getLocationSuggestions,
  saveSearchHistory,
  getRecentSearches,
  getTrendingSearches,
  getPopularCategories,
  clearSearchHistory
};