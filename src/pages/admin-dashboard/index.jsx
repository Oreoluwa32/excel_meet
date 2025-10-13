import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import DashboardOverview from './components/DashboardOverview';
import UserManagement from './components/UserManagement';
import SupportTickets from './components/SupportTickets';
import JobManagement from './components/JobManagement';
import SystemLogs from './components/SystemLogs';
import Analytics from './components/Analytics';

const AdminDashboard = () => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is admin
    if (!loading && userProfile?.role !== 'admin') {
      navigate('/home-dashboard');
    }
  }, [userProfile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'tickets', label: 'Support', icon: '🎫' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'logs', label: 'Logs', icon: '📝' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'tickets':
        return <SupportTickets />;
      case 'jobs':
        return <JobManagement />;
      case 'analytics':
        return <Analytics />;
      case 'logs':
        return <SystemLogs />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-purple-100">Manage your application and monitor performance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>

      <BottomTabNavigation />
    </div>
  );
};

export default AdminDashboard;