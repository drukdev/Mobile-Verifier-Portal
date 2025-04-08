import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomNavbar = ({ isSidebarCollapsed }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`fixed bottom-0 bg-white border-t border-gray-200 py-6 px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      } w-full`}
      style={{ height: '56px' }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 max-w-[1800px] mx-auto h-full">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
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
          <span className="text-xs text-gray-500 whitespace-nowrap">
            © {new Date().getFullYear()} Bhutan NDI
          </span>
          <span className="hidden sm:inline text-xs text-emerald-500 font-medium">
            v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;