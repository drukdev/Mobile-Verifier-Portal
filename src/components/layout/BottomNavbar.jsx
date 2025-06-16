import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const BottomNavbar = ({ isSidebarCollapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 shadow-lg h-20">
      <div
        className={`flex flex-col sm:flex-row items-center justify-between py-3 h-full max-w-7xl mx-auto gap-3 transition-all duration-300 ${
          isSidebarCollapsed ? 'px-6' : 'pl-2 pr-6'
        }`}
      >
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
          <button
            onClick={() => navigate('/dashboard/terms-of-service')}
            className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors duration-200"
          >
            Terms of Service
          </button>
          <button
            onClick={() => navigate('/dashboard/contact-support')}
            className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors duration-200"
          >
            Contact Support
          </button>
        </div>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => navigate('/dashboard/privacy-policy')}
            className="text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors duration-200"
          >
            Privacy Policy
          </button>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={logout}
            className="flex items-center text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
          <div className="hidden sm:flex items-center space-x-4 text-sm">
            <span className="text-slate-500">
              © {new Date().getFullYear()} Bhutan NDI
            </span>
            <span className="text-emerald-600 font-semibold">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;