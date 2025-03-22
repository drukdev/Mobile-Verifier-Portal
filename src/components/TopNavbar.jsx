// src/components/TopNavbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const TopNavbar = ({ title }) => {
  const { role, logout } = useAuth();

  return (
    <div className="bg-white shadow-md p-8 flex justify-between items-center mb-1"> {/* Added mb-0 to ensure no bottom margin */}
      <div className="text-xl font-bold text-gray-600 pl-6">
        {title} {/* Dynamic title */}
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Logged in as: {role}</span>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center"
        >
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;