// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, login, logout } from '../services/api';

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
          setCurrentUser(response.data.user || response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  const handleLogin = async (email, password) => {
    try {
      setError(null);
      const response = await login(email, password);
      
      // Check if the API returns token in the expected format
      const token = response.data.token;
      const user = response.data.user;
      
      if (token && user) {
        localStorage.setItem('token', token);
        setCurrentUser(user);
        return true;
      } else {
        throw new Error('Invalid response format from login API');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear token and user state, even if API call fails
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };
  
  const value = {
    currentUser,
    login: handleLogin,
    logout: handleLogout,
    error,
    loading
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;