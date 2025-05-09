// src/components/common/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ username }) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Usereq Review App</div>
        <div className="flex items-center space-x-4">
          {(username || currentUser) && (
            <div className="flex items-center">
              <span className="mr-2">{username || currentUser?.username || currentUser?.email}</span>
              <div className="h-8 w-8 rounded-full bg-blue-300 flex items-center justify-center">
                {(username || currentUser?.username || currentUser?.email || '?').charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <button 
            className="bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;