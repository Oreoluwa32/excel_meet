import { supabase } from './supabase';

/**
 * Review Service
 * Handles all review-related database operations
 */

/**
 * Fetch reviews for a specific user (reviewee)
 * @param {string} userId - User ID to fetch reviews for
 * @param {number} limit - Maximum number of reviews to fetch
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchUserReviews = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_reviews_with_details', {
        p_user_id: userId,
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching user reviews:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUserReviews:', error);
    return { data: [], error };
  }
};

/**
 * Get user's average rating
 * @param {string} userId - User ID
 * @returns {Promise<{rating: number, error: Error|null}>}
 */
export const getUserAverageRating = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_average_rating', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error fetching user average rating:', error);
      return { rating: 0, error };
    }

    return { rating: parseFloat(data) || 0, error: null };
  } catch (error) {
    console.error('Error in getUserAverageRating:', error);
    return { rating: 0, error };
  }
};

/**
 * Get user's total reviews count
 * @param {string} userId - User ID
 * @returns {Promise<{count: number, error: Error|null}>}
 */
export const getUserReviewsCount = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_reviews_count', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error fetching user reviews count:', error);
      return { count: 0, error };
    }

    return { count: parseInt(data) || 0, error: null };
  } catch (error) {
    console.error('Error in getUserReviewsCount:', error);
    return { count: 0, error };
  }
};

/**
 * Create a new review
 * @param {Object} reviewData - Review data
 * @param {string} reviewData.reviewer_id - ID of user writing the review
 * @param {string} reviewData.reviewee_id - ID of user being reviewed
 * @param {string} reviewData.job_id - ID of related job (optional)
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @param {string} reviewData.service_date - Date service was completed (optional)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createReview:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing review
 * @param {string} reviewId - Review ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateReview = async (reviewId, updates) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateReview:', error);
    return { data: null, error };
  }
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return { success: false, error };
  }
};

/**
 * Check if a user has already reviewed another user for a specific job
 * @param {string} reviewerId - Reviewer user ID
 * @param {string} revieweeId - Reviewee user ID
 * @param {string} jobId - Job ID
 * @returns {Promise<{hasReviewed: boolean, error: Error|null}>}
 */
export const hasUserReviewedForJob = async (reviewerId, revieweeId, jobId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', reviewerId)
      .eq('reviewee_id', revieweeId)
      .eq('job_id', jobId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking review status:', error);
      return { hasReviewed: false, error };
    }

    return { hasReviewed: !!data, error: null };
  } catch (error) {
    console.error('Error in hasUserReviewedForJob:', error);
    return { hasReviewed: false, error };
  }
};

/**
 * Fetch all reviews written by a user
 * @param {string} reviewerId - Reviewer user ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchReviewsByReviewer = async (reviewerId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewee:user_profiles!reviewee_id(full_name, avatar_url),
        job:jobs(title)
      `)
      .eq('reviewer_id', reviewerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews by reviewer:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchReviewsByReviewer:', error);
    return { data: [], error };
  }
};