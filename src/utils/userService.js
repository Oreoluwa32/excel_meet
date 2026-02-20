import { supabase } from './supabase';

/**
 * User Service
 * Handles all user profile-related database operations
 */

/**
 * Fetch user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return { data: null, error };
  }
};

/**
 * Fetch user profile with additional denormalized data (rating, reviews count, jobs posted)
 * Optimized for high performance and high scale
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchUserProfileWithStats = async (userId) => {
  try {
    // Fetch base profile which now contains denormalized stats
    const { data: profile, error: profileError } = await fetchUserProfile(userId);
    
    if (profileError) {
      return { success: false, data: null, error: profileError };
    }

    // Combine all data from the single profile fetch
    const enrichedProfile = {
      ...profile,
      rating: parseFloat(profile.avg_rating) || 0,
      reviewsCount: parseInt(profile.review_count) || 0,
      jobsPosted: parseInt(profile.jobs_posted_count) || 0
    };

    return { success: true, data: enrichedProfile, error: null };
  } catch (error) {
    console.error('Error in fetchUserProfileWithStats:', error);
    return { success: false, data: null, error };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { data: null, error };
  }
};

/**
 * Search users by name or email (Optimized with RPC)
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const searchUsers = async (query, limit = 10) => {
  try {
    const { data, error } = await supabase.rpc('search_professionals_optimized', {
      p_query: query,
      p_limit: limit
    });

    if (error) {
      console.error('Error searching users:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return { data: [], error };
  }
};

/**
 * Fetch multiple user profiles by IDs
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchMultipleUserProfiles = async (userIds) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', userIds);

    if (error) {
      console.error('Error fetching multiple user profiles:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchMultipleUserProfiles:', error);
    return { data: [], error };
  }
};

/**
 * Upload portfolio image to Supabase Storage
 * @param {File} image - Image file to upload
 * @param {string} userId - User ID for organizing images
 * @returns {Promise<{url: string|null, error: Error|null}>}
 */
export const uploadPortfolioImage = async (image, userId) => {
  try {
    if (!image) {
      return { url: null, error: new Error('No image provided') };
    }

    const fileExt = image.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `portfolio-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('portfolios')
      .upload(filePath, image, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading portfolio image:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolios')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error in uploadPortfolioImage:', error);
    return { url: null, error };
  }
};

/**
 * Fetch job statistics for a user (Optimized)
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchUserJobStats = async (userId) => {
  try {
    // Fetch base profile which now contains denormalized stats
    const { data: profile, error } = await fetchUserProfile(userId);
    
    if (error) throw error;

    // Fetch active jobs count (this one is still an RPC as it depends on transient status)
    const { data: activeJobsCount } = await supabase
      .rpc('get_user_active_jobs_count', { p_user_id: userId });

    return {
      data: {
        jobsPosted: profile.jobs_posted_count || 0,
        activeJobs: activeJobsCount || 0,
        completedJobsPosted: profile.jobs_completed_count || 0,
        completedJobsAsProfessional: profile.jobs_completed_count || 0 // Shared for now
      },
      error: null
    };
  } catch (error) {
    console.error('Error in fetchUserJobStats:', error);
    return { data: null, error };
  }
};

/**
 * Fetch user's posted jobs
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchUserPostedJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_posted_jobs', { p_user_id: userId });

    if (error) {
      console.error('Error fetching user posted jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUserPostedJobs:', error);
    return { data: [], error };
  }
};

/**
 * Fetch professional's active jobs (accepted applications)
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchProfessionalActiveJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_professional_active_jobs', { p_user_id: userId });

    if (error) {
      console.error('Error fetching professional active jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchProfessionalActiveJobs:', error);
    return { data: [], error };
  }
};

/**
 * Fetch professional's completed jobs
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchProfessionalCompletedJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_professional_completed_jobs', { p_user_id: userId });

    if (error) {
      console.error('Error fetching professional completed jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchProfessionalCompletedJobs:', error);
    return { data: [], error };
  }
};