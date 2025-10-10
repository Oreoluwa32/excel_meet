import { supabase } from './supabase';

/**
 * Application Service
 * Handles all job application-related database operations
 */

/**
 * Submit a job application
 * @param {string} jobId - Job ID
 * @param {string} applicantId - Applicant user ID
 * @param {string} proposal - Application proposal text
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const submitApplication = async (jobId, applicantId, proposal) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([{
        job_id: jobId,
        applicant_id: applicantId,
        proposal: proposal,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting application:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in submitApplication:', error);
    return { data: null, error };
  }
};

/**
 * Check if user has already applied to a job
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @returns {Promise<{hasApplied: boolean, application: Object|null, error: Error|null}>}
 */
export const checkUserApplication = async (userId, jobId) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('applicant_id', userId)
      .eq('job_id', jobId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking user application:', error);
      return { hasApplied: false, application: null, error };
    }

    return { hasApplied: !!data, application: data, error: null };
  } catch (error) {
    console.error('Error in checkUserApplication:', error);
    return { hasApplied: false, application: null, error };
  }
};

/**
 * Fetch applications for a specific job (for job poster)
 * @param {string} jobId - Job ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchJobApplications = async (jobId) => {
  try {
    // First, fetch applications
    const { data: applications, error: appsError } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (appsError) {
      console.error('Error fetching job applications:', appsError);
      return { data: [], error: appsError };
    }

    if (!applications || applications.length === 0) {
      return { data: [], error: null };
    }

    // Get unique applicant IDs
    const applicantIds = [...new Set(applications.map(app => app.applicant_id))];

    // Fetch applicant profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, full_name, avatar_url, bio, skills, verification_status')
      .in('id', applicantIds);

    if (profilesError) {
      console.error('Error fetching applicant profiles:', profilesError);
      // Return applications without profile data
      return { data: applications, error: null };
    }

    // Create a map of profiles for quick lookup
    const profileMap = {};
    profiles?.forEach(profile => {
      profileMap[profile.id] = profile;
    });

    // Merge applications with profile data
    const enrichedApplications = applications.map(app => ({
      ...app,
      applicant: profileMap[app.applicant_id] || null
    }));

    return { data: enrichedApplications, error: null };
  } catch (error) {
    console.error('Error in fetchJobApplications:', error);
    return { data: [], error };
  }
};

/**
 * Fetch all applications submitted by a user
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchUserApplications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        id,
        job_id,
        proposal,
        status,
        created_at,
        updated_at,
        job:jobs (
          id,
          title,
          category,
          budget_min,
          budget_max,
          budget_type,
          state,
          city,
          status,
          created_at
        )
      `)
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user applications:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUserApplications:', error);
    return { data: [], error };
  }
};

/**
 * Update application status (for job poster)
 * @param {string} applicationId - Application ID
 * @param {string} status - New status ('pending', 'accepted', 'rejected', 'withdrawn')
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    return { data: null, error };
  }
};

/**
 * Withdraw an application (for applicant)
 * @param {string} applicationId - Application ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const withdrawApplication = async (applicationId) => {
  try {
    const { error } = await supabase
      .from('job_applications')
      .update({ status: 'withdrawn' })
      .eq('id', applicationId);

    if (error) {
      console.error('Error withdrawing application:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in withdrawApplication:', error);
    return { success: false, error };
  }
};

/**
 * Delete an application (for applicant, only pending applications)
 * @param {string} applicationId - Application ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteApplication = async (applicationId) => {
  try {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationId);

    if (error) {
      console.error('Error deleting application:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteApplication:', error);
    return { success: false, error };
  }
};

/**
 * Get application count for a job
 * @param {string} jobId - Job ID
 * @returns {Promise<{count: number, error: Error|null}>}
 */
export const getApplicationCount = async (jobId) => {
  try {
    const { count, error } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    if (error) {
      console.error('Error getting application count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error in getApplicationCount:', error);
    return { count: 0, error };
  }
};

export default {
  submitApplication,
  checkUserApplication,
  fetchJobApplications,
  fetchUserApplications,
  updateApplicationStatus,
  withdrawApplication,
  deleteApplication,
  getApplicationCount
};