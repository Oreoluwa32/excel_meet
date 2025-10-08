import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const SupabaseDebug = () => {
  const [status, setStatus] = useState({
    connected: false,
    testing: true,
    error: null,
    session: null
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setStatus({
            connected: false,
            testing: false,
            error: sessionError.message,
            session: null
          });
          return;
        }

        // Test 2: Try to query a table (this will fail if DB is not accessible)
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1);

        if (profileError && !profileError.message.includes('JWT')) {
          setStatus({
            connected: false,
            testing: false,
            error: `Database error: ${profileError.message}`,
            session: sessionData?.session
          });
          return;
        }

        setStatus({
          connected: true,
          testing: false,
          error: null,
          session: sessionData?.session
        });
      } catch (err) {
        setStatus({
          connected: false,
          testing: false,
          error: err.message,
          session: null
        });
      }
    };

    testConnection();
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        {status.testing ? (
          <AlertCircle className="text-yellow-500 flex-shrink-0" size={20} />
        ) : status.connected ? (
          <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
        ) : (
          <XCircle className="text-red-500 flex-shrink-0" size={20} />
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            Supabase Status
          </h4>
          
          {status.testing ? (
            <p className="text-xs text-gray-600">Testing connection...</p>
          ) : status.connected ? (
            <div className="space-y-1">
              <p className="text-xs text-green-600">✓ Connected</p>
              <p className="text-xs text-gray-600">
                Session: {status.session ? 'Active' : 'None'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-red-600">✗ Connection Failed</p>
              {status.error && (
                <p className="text-xs text-gray-600 break-words">
                  {status.error}
                </p>
              )}
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Test Users:
            </p>
            <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
              <li>• admin@excel-meet.com</li>
              <li>• john.doe@excel-meet.com</li>
              <li>• hilton@excel-meet.com</li>
              <li className="text-gray-500">Password: password123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDebug;