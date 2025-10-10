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
 * Fetch user profile with additional computed data (rating, reviews count, jobs posted)
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchUserProfileWithStats = async (userId) => {
  try {
    // Fetch base profile
    const { data: profile, error: profileError } = await fetchUserProfile(userId);
    
    if (profileError) {
      return { success: false, data: null, error: profileError };
    }

    // Fetch average rating
    const { data: avgRating, error: ratingError } = await supabase
      .rpc('get_user_average_rating', { p_user_id: userId });

    // Fetch reviews count
    const { data: reviewsCount, error: reviewsError } = await supabase
      .rpc('get_user_reviews_count', { p_user_id: userId });

    // Fetch jobs posted count
    const { count: jobsPosted, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Combine all data
    const enrichedProfile = {
      ...profile,
      rating: parseFloat(avgRating) || 0,
      reviewsCount: parseInt(reviewsCount) || 0,
      jobsPosted: jobsPosted || 0
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
 * Search users by name or email
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const searchUsers = async (query, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, avatar_url, role, verification_status')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

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
 * Fetch job statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchUserJobStats = async (userId) => {
  try {
    // Fetch jobs posted count
    const { data: jobsPostedCount, error: postedError } = await supabase
      .rpc('get_user_jobs_posted_count', { p_user_id: userId });

    // Fetch active jobs count
    const { data: activeJobsCount, error: activeError } = await supabase
      .rpc('get_user_active_jobs_count', { p_user_id: userId });

    // Fetch completed jobs count (as job poster)
    const { data: completedJobsCount, error: completedError } = await supabase
      .rpc('get_user_completed_jobs_count', { p_user_id: userId });

    // Fetch completed jobs count (as professional)
    const { data: professionalCompletedCount, error: profCompletedError } = await supabase
      .rpc('get_professional_completed_jobs_count', { p_user_id: userId });

    return {
      data: {
        jobsPosted: jobsPostedCount || 0,
        activeJobs: activeJobsCount || 0,
        completedJobsPosted: completedJobsCount || 0,
        completedJobsAsProfessional: professionalCompletedCount || 0
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