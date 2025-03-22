import React, { useState } from 'react';
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaUserCheck,
  FaFileAlt,
} from 'react-icons/fa';
import { RiOrganizationChart } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png'; // Path to your logo

const Sidebar = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, role } = useAuth();
  const location = useLocation(); // Get current route location
  const navigate = useNavigate(); // For navigation

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    onToggle(!isCollapsed); // Notify the parent component (Dashboard) about the toggle
  };

  const handleLogoClick = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <div className="relative">
      <div
        className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white border-r shadow-md flex flex-col transition-all duration-300 overflow-hidden font-sans`}
      >
        {/* Collapse Button */}
        <button
          className="absolute -right-4 top-10 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 transition"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <FaChevronRight size={20} style={{ color: 'emerald' }} />
          ) : (
            <FaChevronLeft size={20} style={{ color: 'emerald' }} />
          )}
        </button>

        {/* Sidebar Header */}
        <div
          className={`flex items-center justify-center ${
            isCollapsed ? 'py-1.5' : 'py-1' // Reduce padding-bottom when not collapsed
          } border-b border-gray-200 border-opacity-50 cursor-pointer`}
          onClick={handleLogoClick} // Make the logo section clickable
        >
          <img
            src={logo}
            alt="Logo"
            className={`transition-all duration-300 ${
              isCollapsed ? 'h-16 w-38 -pt-8' : 'h-17 w-17' // Adjust logo image size directly
            }`}
          />
        </div>

        {/* Sidebar Items */}
        <nav
          className={`flex-1 pt-6 px-3 py-4 ${
            isCollapsed ? 'pt-10' : 'pt-6' // Add extra padding top when collapsed
          }`}
        >
          <ul className="space-y-2">
            {/* Admin Items */}
            {/* {role === 'admin' && (
              <NavItem
                icon={<RiOrganizationChart style={{ color: 'green' }} />}
                label="Create Organization"
                path="/dashboard/create-organization"
                active={location.pathname === '/dashboard/create-organization'}
                isCollapsed={isCollapsed}
              />
            )} */}

            {/* Client Items */}
            {role === 'client' && (
              <>
                <NavItem
                  icon={<RiOrganizationChart style={{ color: 'emerald' }} />}
                  label="Create Organization"
                  path="/dashboard/create-organization"
                  active={location.pathname === '/dashboard/create-organization'}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<FaUsers style={{ color: 'emerald' }} />} // Icon for Verifier Role
                  label="Verifier Role"
                  path="/dashboard/verifier-role"
                  active={location.pathname === '/dashboard/verifier-role'}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<FaUserCheck style={{ color: 'emerald' }} />} // Icon for Verifier User
                  label="Verifier User"
                  path="/dashboard/verifier-user"
                  active={location.pathname === '/dashboard/verifier-user'}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<FaFileAlt style={{ color: 'emerald' }} />} // Icon for Proof Templates
                  label="Proof Templates"
                  path="/dashboard/proof-templates"
                  active={location.pathname === '/dashboard/proof-templates'}
                  isCollapsed={isCollapsed}
                />
              </>
            )}

            {/* Common Items */}
            <NavItem
              icon={<FaCog style={{ color: 'emerald' }} />}
              label="Settings"
              path="/dashboard/settings"
              active={location.pathname === '/dashboard/settings'}
              isCollapsed={isCollapsed}
            />
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-6 py-4 border-t">
          <button
            onClick={logout}
            className="flex items-center w-full text-gray-600 hover:text-red-500 font-medium"
          >
            <FaSignOutAlt className="w-5 h-5" style={{ color: 'red' }} />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, path, active, isCollapsed }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <li>
      <div
        onClick={handleClick}
        className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition ${
          active
            ? 'bg-green-100 text-emerald-400 font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {isCollapsed ? (
          <span className="w-6 h-6"> {/* Increase the size of the container */}
            {React.cloneElement(icon, { size: 24 })}{" "}
            {/* Increase the icon size */}
          </span>
        ) : (
          icon
        )}
        {!isCollapsed && <span className="ml-3">{label}</span>}
      </div>
    </li>
  );
};

export default Sidebar;