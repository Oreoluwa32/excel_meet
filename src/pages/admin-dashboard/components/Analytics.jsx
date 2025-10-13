import React, { useState, useEffect } from 'react';
import adminService from '../../../utils/adminService';

const Analytics = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const result = await adminService.getUserActivityStats(timeRange);
    
    if (result.success) {
      setActivityData(result.data || []);
    }
    
    setLoading(false);
  };

  const calculateTotals = () => {
    if (!activityData.length) return { users: 0, jobs: 0, applications: 0 };
    
    return activityData.reduce(
      (acc, day) => ({
        users: acc.users + (parseInt(day.new_users) || 0),
        jobs: acc.jobs + (parseInt(day.new_jobs) || 0),
        applications: acc.applications + (parseInt(day.new_applications) || 0),
      }),
      { users: 0, jobs: 0, applications: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
        <div className="flex gap-2">
          {[7, 14, 30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === days
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-3xl font-bold mb-1">{totals.users}</div>
          <div className="text-blue-100">New Users</div>
          <div className="text-sm text-blue-100 mt-2">Last {timeRange} days</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="text-3xl mb-2">💼</div>
          <div className="text-3xl font-bold mb-1">{totals.jobs}</div>
          <div className="text-purple-100">New Jobs</div>
          <div className="text-sm text-purple-100 mt-2">Last {timeRange} days</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-3xl font-bold mb-1">{totals.applications}</div>
          <div className="text-green-100">New Applications</div>
          <div className="text-sm text-green-100 mt-2">Last {timeRange} days</div>
        </div>
      </div>

      {/* Activity Chart */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Over Time</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    New Users
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    New Jobs
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Applications
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activityData.slice().reverse().map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(day.activity_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {day.new_users}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {day.new_jobs}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {day.new_applications}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Growth Metrics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Growth Metrics</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">User Growth</span>
              <span className="text-sm font-semibold text-blue-600">{totals.users} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totals.users / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Job Postings</span>
              <span className="text-sm font-semibold text-purple-600">{totals.jobs} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totals.jobs / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Applications</span>
              <span className="text-sm font-semibold text-green-600">{totals.applications} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totals.applications / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;