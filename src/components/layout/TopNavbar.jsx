import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ title, isSidebarCollapsed }) => {
  const { role } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Main Top Navigation */}
      <div 
      className= "bg-white-400 border-b border-gray-200 ml-0 py-7 p-4 mb-1 flex justify-between items-center sticky top-0 z-10 transition-all duration-300">
        {/* Title moved completely left with no extra spacing */}
        <h1 className="text-xl font-bold flex items-center">
          <span className="bg-gradient-to-r pl-4 from-emerald-600 to-teal-700 bg-clip-text text-transparent">
            {title}
          </span>
          <span className="ml-2 text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
            Bhutan NDI
          </span>
        </h1>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-700 capitalize"> Logged In As: 
              {role}
            </span>
          </div>
    {/* BUtton */}
        </div>
      </div>
      {/* Fixed Bottom Navigation */}
      <div 
        className="fixed  bottom-0 bg-white-400 border-t border-gray-200 py-3 w-screen transition-all duration-300">
        <div className="flex flex-col  justify-evenly bg-white-400 pl-0 sm:flex-row ml-1  gap-1">
          <div className="flex justify-start gap-1 sm:gap-6">
            <button 
              onClick={() => navigate('/dashboard/privacy-policy')}
              className="text-xs text-gray-500 hover:text-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => navigate('/dashboard/terms-of-service')}
              className="text-xs text-gray-500 hover:text-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
            >
              Terms
            </button>
          </div>
          <div className="flex items-end gap-3">
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