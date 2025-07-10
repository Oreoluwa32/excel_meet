import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import LoginRegister from "pages/login-register";
import JobDetails from "pages/job-details";
import ProfessionalProfile from "pages/professional-profile";
import HomeDashboard from "pages/home-dashboard";
import SearchDiscovery from "pages/search-discovery";
import UserProfileManagement from "pages/user-profile-management";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/login-register" element={<LoginRegister />} />
        <Route path="/job-details" element={<JobDetails />} />
        <Route path="/professional-profile" element={<ProfessionalProfile />} />
        <Route path="/home-dashboard" element={<HomeDashboard />} />
        <Route path="/search-discovery" element={<SearchDiscovery />} />
        <Route path="/user-profile-management" element={<UserProfileManagement />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;