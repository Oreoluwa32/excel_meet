import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";
// Add your imports here
import Landing from "pages/landing";
import LoginRegister from "pages/login-register";
import ForgotPassword from "pages/forgot-password";
import ResetPassword from "pages/reset-password";
import EmailVerified from "pages/email-verified";
import JobDetails from "pages/job-details";
import JobApplications from "pages/job-applications";
import Notifications from "pages/notifications";
import ProfessionalProfile from "pages/professional-profile";
import HomeDashboard from "pages/home-dashboard";
import SearchDiscovery from "pages/search-discovery";
import UserProfileManagement from "pages/user-profile-management";
import SavedJobs from "pages/saved-jobs";
import Messages from "pages/messages";
import AdminDashboard from "pages/admin-dashboard";
import NotFound from "pages/NotFound";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-register" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-register" replace />;
  }

  if (userProfile?.role !== 'admin') {
    return <Navigate to="/home-dashboard" replace />;
  }

  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login-register" element={<LoginRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        
        {/* Protected routes */}
        <Route 
          path="/home-dashboard" 
          element={
            <ProtectedRoute>
              <HomeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/job-details" 
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/professional-profile" 
          element={
            <ProtectedRoute>
              <ProfessionalProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search-discovery" 
          element={
            <ProtectedRoute>
              <SearchDiscovery />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-profile-management" 
          element={
            <ProtectedRoute>
              <UserProfileManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/saved-jobs" 
          element={
            <ProtectedRoute>
              <SavedJobs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/job-applications" 
          element={
            <ProtectedRoute>
              <JobApplications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;