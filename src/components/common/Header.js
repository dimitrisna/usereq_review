// src/components/common/Header.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardCheck, ChevronDown, LogOut } from 'lucide-react';

const Header = ({ username }) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = username || currentUser?.username || currentUser?.email || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <Link to="/dashboard" className="flex items-center space-x-2 text-white hover:text-indigo-100 transition-colors">
            <div className="h-8 w-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <ClipboardCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold">Usereq Review</span>
          </Link>
          
          {/* User Profile and Menu */}
          <div className="relative">
            <button 
              className="flex items-center space-x-3 text-white hover:text-indigo-100 focus:outline-none" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-medium shadow-sm border border-white border-opacity-30">
                  {userInitial}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{displayName}</p>
                </div>
              </div>
              <ChevronDown size={16} className="text-white text-opacity-70" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;