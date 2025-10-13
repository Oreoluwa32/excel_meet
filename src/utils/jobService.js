import { supabase } from './supabase';

/**
 * Job Service
 * Handles all job-related database operations
 */

/**
 * Upload job images to Supabase Storage
 * @param {Array<File>} images - Array of image files
 * @param {string} jobId - Job ID for organizing images
 * @returns {Promise<{urls: Array<string>, error: Error|null}>}
 */
export const uploadJobImages = async (images, jobId) => {
  try {
    if (!images || images.length === 0) {
      return { urls: [], error: null };
    }

    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${jobId}_${index}_${Date.now()}.${fileExt}`;
      const filePath = `job-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('jobs')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jobs')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    const urls = await Promise.all(uploadPromises);
    return { urls, error: null };
  } catch (error) {
    console.error('Error in uploadJobImages:', error);
    return { urls: [], error };
  }
};

/**
 * Fetch jobs with optional filters and pagination
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {string} options.urgency - Filter by urgency level
 * @param {string} options.state - Filter by state
 * @param {string} options.city - Filter by city
 * @param {string} options.status - Filter by status (default: 'open')
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @returns {Promise<{data: Array, error: Error|null, hasMore: boolean}>}
 */
export const fetchJobs = async (options = {}) => {
  try {
    const {
      category = null,
      urgency = null,
      state = null,
      city = null,
      status = 'open',
      page = 1,
      limit = 10
    } = options;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (urgency) {
      query = query.eq('urgency', urgency);
    }

    if (state) {
      query = query.eq('state', state);
    }

    if (city) {
      query = query.eq('city', city);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return { data: [], error, hasMore: false };
    }

    // Calculate if there are more pages
    const hasMore = count > offset + limit;

    return { data: data || [], error: null, hasMore };
  } catch (error) {
    console.error('Error in fetchJobs:', error);
    return { data: [], error, hasMore: false };
  }
};

/**
 * Fetch a single job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchJobById = async (jobId) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in fetchJobById:', error);
    return { data: null, error };
  }
};

/**
 * Create a new job
 * @param {Object} jobData - Job data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createJob = async (jobData) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createJob:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing job
 * @param {string} jobId - Job ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateJob = async (jobId, updates) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateJob:', error);
    return { data: null, error };
  }
};

/**
 * Delete a job
 * @param {string} jobId - Job ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteJob = async (jobId) => {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteJob:', error);
    return { success: false, error };
  }
};

/**
 * Fetch jobs by user ID
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchUserJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUserJobs:', error);
    return { data: [], error };
  }
};

/**
 * Subscribe to real-time job updates
 * @param {Function} callback - Callback function to handle updates
 * @returns {Object} Subscription object
 */
export const subscribeToJobs = (callback) => {
  const subscription = supabase
    .channel('jobs_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs'
      },
      (payload) => {
        console.log('Job update received:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from real-time updates
 * @param {Object} subscription - Subscription object
 */
export const unsubscribeFromJobs = async (subscription) => {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
};

/**
 * Search jobs by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Additional options
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const searchJobs = async (keyword, options = {}) => {
  try {
    const { status = 'open', limit = 20 } = options;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in searchJobs:', error);
    return { data: [], error };
  }
};

/**
 * Get job statistics
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getJobStats = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('status, urgency, category');

    if (error) {
      console.error('Error fetching job stats:', error);
      return { data: null, error };
    }

    // Calculate statistics
    const stats = {
      total: data.length,
      byStatus: {},
      byUrgency: {},
      byCategory: {}
    };

    data.forEach(job => {
      // Count by status
      stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;
      
      // Count by urgency
      stats.byUrgency[job.urgency] = (stats.byUrgency[job.urgency] || 0) + 1;
      
      // Count by category
      stats.byCategory[job.category] = (stats.byCategory[job.category] || 0) + 1;
    });

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error in getJobStats:', error);
    return { data: null, error };
  }
};

/**
 * Save/bookmark a job
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const saveJob = async (userId, jobId) => {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert([{ user_id: userId, job_id: jobId }])
      .select()
      .single();

    if (error) {
      console.error('Error saving job:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in saveJob:', error);
    return { data: null, error };
  }
};

/**
 * Unsave/unbookmark a job
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const unsaveJob = async (userId, jobId) => {
  try {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) {
      console.error('Error unsaving job:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in unsaveJob:', error);
    return { success: false, error };
  }
};

/**
 * Check if a job is saved by user
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @returns {Promise<{isSaved: boolean, error: Error|null}>}
 */
export const isJobSaved = async (userId, jobId) => {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking if job is saved:', error);
      return { isSaved: false, error };
    }

    return { isSaved: !!data, error: null };
  } catch (error) {
    console.error('Error in isJobSaved:', error);
    return { isSaved: false, error };
  }
};

/**
 * Fetch saved jobs for a user
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchSavedJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        id,
        created_at,
        job:jobs (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved jobs:', error);
      return { data: [], error };
    }

    // Extract job data from the nested structure
    const jobs = data.map(item => item.job).filter(job => job !== null);

    return { data: jobs, error: null };
  } catch (error) {
    console.error('Error in fetchSavedJobs:', error);
    return { data: [], error };
  }
};

/**
 * Get job statistics for a user (jobs posted, active, completed)
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getUserJobStats = async (userId) => {
  try {
    const { data: jobsPosted, error: error1 } = await supabase
      .rpc('get_user_jobs_posted_count', { p_user_id: userId });

    const { data: activeJobs, error: error2 } = await supabase
      .rpc('get_user_active_jobs_count', { p_user_id: userId });

    const { data: completedJobs, error: error3 } = await supabase
      .rpc('get_user_completed_jobs_count', { p_user_id: userId });

    if (error1 || error2 || error3) {
      const error = error1 || error2 || error3;
      console.error('Error fetching user job stats:', error);
      return { data: null, error };
    }

    return {
      data: {
        jobsPosted: jobsPosted || 0,
        activeJobs: activeJobs || 0,
        completedJobs: completedJobs || 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getUserJobStats:', error);
    return { data: null, error };
  }
};

/**
 * Get jobs posted by a user with details
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getUserPostedJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_posted_jobs', { p_user_id: userId });

    if (error) {
      console.error('Error fetching user posted jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getUserPostedJobs:', error);
    return { data: [], error };
  }
};

/**
 * Get active jobs for a professional (accepted applications)
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getProfessionalActiveJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_professional_active_jobs', { p_user_id: userId });

    if (error) {
      console.error('Error fetching professional active jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getProfessionalActiveJobs:', error);
    return { data: [], error };
  }
};

/**
 * Get completed jobs for a professional
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getProfessionalCompletedJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_professional_completed_jobs', { p_user_id: userId });

    if (error) {
      console.error('Error fetching professional completed jobs:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getProfessionalCompletedJobs:', error);
    return { data: [], error };
  }
};

/**
 * Get count of completed jobs as a professional
 * @param {string} userId - User ID
 * @returns {Promise<{data: number, error: Error|null}>}
 */
export const getProfessionalCompletedJobsCount = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_professional_completed_jobs_count', { p_user_id: userId });

    if (error) {
      console.error('Error fetching professional completed jobs count:', error);
      return { data: 0, error };
    }

    return { data: data || 0, error: null };
  } catch (error) {
    console.error('Error in getProfessionalCompletedJobsCount:', error);
    return { data: 0, error };
  }
};

/**
 * Toggle accepting applications for a job
 * @param {string} jobId - Job ID
 * @param {boolean} acceptingApplications - Whether to accept applications
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const toggleAcceptingApplications = async (jobId, acceptingApplications) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ accepting_applications: acceptingApplications })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling accepting applications:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in toggleAcceptingApplications:', error);
    return { data: null, error };
  }
};

export default {
  uploadJobImages,
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  fetchUserJobs,
  subscribeToJobs,
  unsubscribeFromJobs,
  searchJobs,
  getJobStats,
  saveJob,
  unsaveJob,
  isJobSaved,
  fetchSavedJobs,
  getUserJobStats,
  getUserPostedJobs,
  getProfessionalActiveJobs,
  getProfessionalCompletedJobs,
  getProfessionalCompletedJobsCount,
  toggleAcceptingApplications
};