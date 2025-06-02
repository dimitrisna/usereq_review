// src/pages/LoginPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { error } = useAuth();

  const handleAuth0Login = () => {
    // Redirect to Auth0 login
    window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth/login?redirectTo=${window.location.origin}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome to</h1>
          <h2 className="text-2xl font-bold mb-8 text-blue-600">Usereq Review App</h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleAuth0Login}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Sign in with Auth0
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Secure authentication powered by Auth0
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="text-xs text-gray-500">
            <p>By signing in, you agree to our terms of service</p>
            <p>and privacy policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;