import { supabase } from './supabase';

/**
 * Admin Service
 * Handles all admin-related operations including analytics, user management, and support tickets
 */

const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user activity statistics over time
   */
  async getUserActivityStats(daysBack = 30) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_activity_stats', { days_back: daysBack });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user activity stats:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all users with filters
   */
  async getUsers(filters = {}) {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }

      if (filters.subscription_plan) {
        query = query.eq('subscription_plan', filters.subscription_plan);
      }

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { success: true, data, count };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user profile (admin only)
   */
  async updateUser(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all support tickets
   */
  async getSupportTickets(filters = {}) {
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_profiles!support_tickets_user_id_fkey(id, full_name, email, avatar_url),
          assigned_admin:user_profiles!support_tickets_assigned_to_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get single support ticket with responses
   */
  async getSupportTicket(ticketId) {
    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_profiles!support_tickets_user_id_fkey(id, full_name, email, avatar_url),
          assigned_admin:user_profiles!support_tickets_assigned_to_fkey(id, full_name, email)
        `)
        .eq('id', ticketId)
        .single();

      if (ticketError) throw ticketError;

      const { data: responses, error: responsesError } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          user:user_profiles(id, full_name, email, avatar_url, role)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (responsesError) throw responsesError;

      return { success: true, data: { ...ticket, responses } };
    } catch (error) {
      console.error('Error fetching support ticket:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create support ticket
   */
  async createSupportTicket(ticketData) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update support ticket
   */
  async updateSupportTicket(ticketId, updates) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating support ticket:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get ticket responses
   */
  async getTicketResponses(ticketId) {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          user_profiles!ticket_responses_user_id_fkey(id, full_name, email, avatar_url, role),
          admin_profiles:user_profiles!ticket_responses_user_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching ticket responses:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Add response to support ticket
   */
  async addTicketResponse(ticketId, userId, message, isAdminResponse = false) {
    try {
      const { data, error } = await supabase
        .from('ticket_responses')
        .insert([{
          ticket_id: ticketId,
          user_id: userId,
          message,
          is_admin_response: isAdminResponse
        }])
        .select()
        .single();

      if (error) throw error;

      // Update ticket status to in_progress if it was open
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', ticketId)
        .eq('status', 'open');

      return { success: true, data };
    } catch (error) {
      console.error('Error adding ticket response:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all jobs with filters
   */
  async getJobs(filters = {}) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          poster:user_profiles(id, full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete job (admin only)
   */
  async deleteJob(jobId) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get system logs
   */
  async getSystemLogs(filters = {}) {
    try {
      let query = supabase
        .from('system_logs')
        .select(`
          *,
          user:user_profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(filters.limit || 100);

      if (filters.log_level) {
        query = query.eq('log_level', filters.log_level);
      }

      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching system logs:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create system log
   */
  async createSystemLog(logData) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert([logData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error creating system log:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get app analytics
   */
  async getAppAnalytics(metricName = null, daysBack = 30) {
    try {
      let query = supabase
        .from('app_analytics')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      if (metricName) {
        query = query.eq('metric_name', metricName);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching app analytics:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Record app analytics
   */
  async recordAnalytics(metricName, metricValue, metricType, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('app_analytics')
        .insert([{
          metric_name: metricName,
          metric_value: metricValue,
          metric_type: metricType,
          metadata
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error recording analytics:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      // Get various performance metrics
      const [
        responseTimeResult,
        errorRateResult,
        activeUsersResult
      ] = await Promise.all([
        this.getAppAnalytics('response_time', 7),
        this.getAppAnalytics('error_rate', 7),
        this.getAppAnalytics('active_users', 7)
      ]);

      return {
        success: true,
        data: {
          responseTime: responseTimeResult.data || [],
          errorRate: errorRateResult.data || [],
          activeUsers: activeUsersResult.data || []
        }
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return { success: false, error: error.message };
    }
  }
};

export default adminService;