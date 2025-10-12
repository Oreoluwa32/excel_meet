import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerified = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated (email was verified)
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If user is authenticated, start countdown to redirect
    if (user && !isVerifying) {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            navigate('/home-dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [user, isVerifying, navigate]);

  const handleLoginClick = () => {
    navigate('/login-register');
  };

  const handleDashboardClick = () => {
    navigate('/home-dashboard');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Your Email
          </h1>
          <p className="text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Email Verified! 🎉
        </h1>
        <p className="text-gray-600 mb-8">
          Your email has been successfully verified. You can now access all features of Excel Meet.
        </p>

        {/* Email Icon with Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center gap-3 text-blue-700">
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium">
              Welcome to Excel Meet!
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {user ? (
          <div className="space-y-4">
            <Button
              onClick={handleDashboardClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-gray-500">
              Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleLoginClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Login to Your Account
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-gray-500">
              Please login to start using Excel Meet
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@excelmeet.com" className="text-blue-600 hover:text-blue-700 font-medium">
              support@excelmeet.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;