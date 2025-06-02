// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await getCurrentUser();
          const userData = response.data.user || response.data;
          setCurrentUser(userData);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  const handleAuth0Success = (token, user) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setError(null);
    setLoading(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.clear();
    setCurrentUser(null);
    setError(null);
    
    setTimeout(() => {
      const logoutUrl = `${process.env.REACT_APP_API_URL}/api/oauth/logout?returnTo=${encodeURIComponent(window.location.origin)}`;
      window.location.href = logoutUrl;
    }, 100);
  };
  
  const value = {
    currentUser,
    loading,
    error,
    logout: handleLogout,
    handleAuth0Success
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;