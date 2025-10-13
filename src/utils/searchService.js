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
      .select('*, user_profiles!jobs_user_id_fkey(full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'open');

    // Apply search query
    if (query.trim()) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`
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
        queryBuilder = queryBuilder
          .order('urgency', { ascending: false })
          .order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Error searching jobs:', error);
      return { data: [], error, hasMore: false, total: 0 };
    }

    // Calculate if there are more pages
    const hasMore = count > offset + limit;

    return { 
      data: data || [], 
      error: null, 
      hasMore,
      total: count || 0
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
        reviews:reviews!reviews_reviewed_user_id_fkey(rating)
      `, { count: 'exact' })
      .eq('role', 'professional');

    // Apply search query
    if (query.trim()) {
      queryBuilder = queryBuilder.or(
        `full_name.ilike.%${query}%,bio.ilike.%${query}%,location.ilike.%${query}%`
      );
    }

    // Apply skills filter
    if (skills.length > 0) {
      queryBuilder = queryBuilder.overlaps('skills', skills);
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

    // Execute query
    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Error searching professionals:', error);
      return { data: [], error, hasMore: false, total: 0 };
    }

    // Calculate average rating for each professional
    let professionals = (data || []).map(prof => {
      const ratings = prof.reviews?.map(r => r.rating) || [];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0;
      
      return {
        ...prof,
        rating: avgRating,
        reviewCount: ratings.length
      };
    });

    // Apply rating filter if specified
    if (minRating !== null) {
      professionals = professionals.filter(prof => prof.rating >= minRating);
    }

    // Sort by rating if requested
    if (sortBy === 'rating') {
      professionals.sort((a, b) => b.rating - a.rating);
    }

    // Calculate if there are more pages
    const hasMore = count > offset + limit;

    return { 
      data: professionals, 
      error: null, 
      hasMore,
      total: count || 0
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
      .select('*, user_profiles!jobs_user_id_fkey(full_name, avatar_url)')
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
    const { data, error } = await supabase
      .from('jobs')
      .select('category')
      .eq('status', 'open');

    if (error) {
      console.error('Error fetching job categories:', error);
      return { data: [], error };
    }

    // Get unique categories
    const categories = [...new Set(data.map(job => job.category))].sort();

    return { data: categories, error: null };
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
    const { data, error } = await supabase
      .from('user_profiles')
      .select('skills')
      .eq('role', 'professional')
      .not('skills', 'is', null);

    if (error) {
      console.error('Error fetching available skills:', error);
      return { data: [], error };
    }

    // Flatten and get unique skills
    const allSkills = data.flatMap(prof => prof.skills || []);
    const uniqueSkills = [...new Set(allSkills)].sort();

    return { data: uniqueSkills, error: null };
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
      console.error('Error fetching location suggestions:', error);
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

export default {
  searchJobs,
  searchProfessionals,
  getPopularSearches,
  getTrendingJobs,
  getJobCategories,
  getAvailableSkills,
  getLocationSuggestions
};