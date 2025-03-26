import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ title, isSidebarCollapsed }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Main Top Navigation */}
      <div 
      className= "bg-white-400 border-b border-gray-200 ml-0 py-7 p-4 mb-1 flex justify-between items-center sticky top-0 z-10 transition-all duration-300">
        {/* Title moved completely left with no extra spacing */}
        <h1 className="text-xl font-bold flex items-center">
          <span className="bg-gradient-to-r  from-emerald-600 to-teal-700 bg-clip-text text-transparent">
            {title}
          </span>
          <span className="ml-2 text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
            Bhutan NDI
          </span>
        </h1>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-700 capitalize">
              {role}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 bg-white border border-emerald-100 text-emerald-600 shadow-sm hover:shadow-md"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-emerald-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-xs font-semibold">
              Sign Out
            </span>
          </button>
        </div>
      </div>
      {/* Fixed Bottom Navigation */}
      <div 
        className="fixed bottom-0 bg-white-400 border-t border-gray-200 py-2 w-full transition-all duration-300">
        <div className="flex flex-col bg-white-400 pl-0 sm:flex-row justify-around ml-1 items-start gap-3 w-full">
          <div className="flex items-start gap-3 sm:gap-6">
            <button 
              onClick={() => navigate('/privacy-policy')}
              className="text-xs text-gray-500 hover:text-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => navigate('/terms-of-service')}
              className="text-xs text-gray-500 hover:text-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
            >
              Terms
            </button>
            <button 
              onClick={() => navigate('/contact-support')}
              className="text-xs text-gray-500 hover:text-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
            >
              Contact
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 whitespace-wrap">
              © {new Date().getFullYear()} Bhutan NDI
            </span>
            <span className="hidden sm:inline text-xs text-emerald-500 font-medium">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNavbar;