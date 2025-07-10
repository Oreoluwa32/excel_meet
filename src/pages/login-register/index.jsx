import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialLogin from './components/SocialLogin';
import TrustSignals from './components/TrustSignals';
import AppLogo from './components/AppLogo';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/home-dashboard');
    }
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-modal p-8 border border-border">
          {/* App Logo */}
          <AppLogo />
          
          {/* Auth Tabs */}
          <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          {/* Auth Forms */}
          <div className="space-y-6">
            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
            
            {/* Social Login */}
            <SocialLogin />
          </div>
          
          {/* Trust Signals */}
          <TrustSignals />
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;