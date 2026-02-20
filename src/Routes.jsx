import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { useAuth } from "contexts/AuthContext";

const Landing = lazy(() => import("pages/landing"));
const LoginRegister = lazy(() => import("pages/login-register"));
const ForgotPassword = lazy(() => import("pages/forgot-password"));
const ResetPassword = lazy(() => import("pages/reset-password"));
const EmailVerified = lazy(() => import("pages/email-verified"));
const JobDetails = lazy(() => import("pages/job-details"));
const JobApplications = lazy(() => import("pages/job-applications"));
const Notifications = lazy(() => import("pages/notifications"));
const ProfessionalProfile = lazy(() => import("pages/professional-profile"));
const HomeDashboard = lazy(() => import("pages/home-dashboard"));
const SearchDiscovery = lazy(() => import("pages/search-discovery"));
const UserProfileManagement = lazy(() => import("pages/user-profile-management"));
const SavedJobs = lazy(() => import("pages/saved-jobs"));
const Messages = lazy(() => import("pages/messages"));
const AdminDashboard = lazy(() => import("pages/admin-dashboard"));
const MyTickets = lazy(() => import("pages/my-tickets"));
const NotFound = lazy(() => import("pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading page...</p>
    </div>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
          path="/my-tickets" 
          element={
            <ProtectedRoute>
              <MyTickets />
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
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;