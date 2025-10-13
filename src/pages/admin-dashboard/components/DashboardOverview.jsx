import React, { useState, useEffect } from 'react';
import adminService from '../../../utils/adminService';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    const result = await adminService.getDashboardStats();
    
    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading statistics: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      change: `+${stats?.new_users_30d || 0} this month`,
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Professionals',
      value: stats?.total_professionals || 0,
      subtitle: 'Active professionals',
      icon: '⭐',
      color: 'green',
    },
    {
      title: 'Clients',
      value: stats?.total_clients || 0,
      subtitle: 'Active clients',
      icon: '🤝',
      color: 'purple',
    },
    {
      title: 'Total Jobs',
      value: stats?.total_jobs || 0,
      change: `+${stats?.new_jobs_30d || 0} this month`,
      icon: '💼',
      color: 'indigo',
    },
    {
      title: 'Applications',
      value: stats?.total_applications || 0,
      change: `+${stats?.new_applications_30d || 0} this month`,
      icon: '📝',
      color: 'yellow',
    },
    {
      title: 'Support Tickets',
      value: stats?.total_tickets || 0,
      change: `${stats?.open_tickets || 0} open`,
      icon: '🎫',
      color: 'red',
    },
    {
      title: 'Reviews',
      value: stats?.total_reviews || 0,
      subtitle: `Avg: ${stats?.average_rating ? Number(stats.average_rating).toFixed(1) : '0.0'} ⭐`,
      icon: '⭐',
      color: 'orange',
    },
    {
      title: 'Active Tickets',
      value: stats?.in_progress_tickets || 0,
      change: `${stats?.new_tickets_7d || 0} this week`,
      icon: '🔄',
      color: 'teal',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200',
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${colorClasses[card.color]} border rounded-lg p-6 transition-transform hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{card.icon}</div>
              <div className="text-right">
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-sm opacity-75">{card.title}</div>
              </div>
            </div>
            {card.change && (
              <div className="text-sm font-medium opacity-75">{card.change}</div>
            )}
            {card.subtitle && (
              <div className="text-sm font-medium opacity-75">{card.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl">👥</span>
            <div className="text-left">
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-gray-600">View and edit user profiles</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🎫</span>
            <div className="text-left">
              <div className="font-medium">Support Tickets</div>
              <div className="text-sm text-gray-600">Respond to user complaints</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <div className="font-medium">View Analytics</div>
              <div className="text-sm text-gray-600">Check app performance</div>
            </div>
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Database</span>
            </div>
            <span className="text-green-600 text-sm font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">API Services</span>
            </div>
            <span className="text-green-600 text-sm font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Storage</span>
            </div>
            <span className="text-green-600 text-sm font-medium">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;