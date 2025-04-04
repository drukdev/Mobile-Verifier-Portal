import React, { useState } from 'react';
import {
  FaQuestion,
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
import logo from '../assets/images/logo1.png';
import logocollapse from '../assets/images/logo-collapse.png'

const Sidebar = ({ onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    onToggle(!isCollapsed);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="relative">
      <div
        className={`${isCollapsed ? 'w-16' : 'w-64'} h-full  bg-gradient-to-b from-white-50 to-white-100 border-r border-gray-200  flex flex-col transition-all duration-300 ease-in-out overflow-hidden font-sans`}
      >
        {/* Collapse Button */}
        <button
          className="absolute -right-4 top-7 bg-white p-2 rounded-full shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-200 group"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <FaChevronRight size={15} className="text-emerald-500 group-hover:text-emerald-600" />
          ) : (
            <FaChevronLeft size={20} className="text-emerald-500 group-hover:text-emerald-600" />
          )}
        </button>

        {/* Sidebar Header */}
        <div
          className={`flex items-center justify-center py-4  border-b border-gray-300 border-opacity-50 cursor-pointer hover:bg-gray-50 transition-colors duration-200`}
          onClick={handleLogoClick}
        >
          
          {isCollapsed ? ( <img
            src={logocollapse}
            alt="Logo"
            className={`transition-all duration-300 ${isCollapsed ? 'h-14 w-12 p-0' : 'h-14 -ml-14 w-auto'} brightness-110 contrast-110`}
          />) : (<img
            src={logo}
            alt="Logo"
            className={`transition-all duration-300 ${isCollapsed ? 'h-10 w-10' : 'h-14 -ml-14 w-auto'} brightness-110 contrast-110`}
          />)}
        </div>

        {/* Sidebar Items */}
        <nav
          className={`flex-1 pt-6 px-3 py-4 ${isCollapsed ? 'pt-10' : 'pt-6'}`}
        >
          <ul className="space-y-1">
            {/* Client Items */}
            {role === 'client' && (
              <>
                <NavItem
                  icon={<FaUsers className="text-emerald-500 group-hover:text-emerald-600" />}
                  label="Verifier Role"
                  path="/dashboard/verifier-role"
                  active={location.pathname === '/dashboard/verifier-role'}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<FaUserCheck className="text-emerald-500 group-hover:text-emerald-600" />}
                  label="Verifier User"
                  path="/dashboard/verifier-user"
                  active={location.pathname === '/dashboard/verifier-user'}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  icon={<FaFileAlt className="text-emerald-500 group-hover:text-emerald-600" />}
                  label="Proof Templates"
                  path="/dashboard/proof-templates"
                  active={location.pathname === '/dashboard/proof-templates'}
                  isCollapsed={isCollapsed}
                />
              </>
            )} 
            { role === 'admin' && (
              <NavItem
                  icon={<RiOrganizationChart className="text-emerald-500 group-hover:text-emerald-600" />}
                  label="Create Organization"
                  path="/dashboard/create-organization"
                  active={location.pathname === '/dashboard/create-organization'}
                  isCollapsed={isCollapsed}
                />
            )}

            {/* Common Items */}
            <NavItem
              icon={<FaQuestion className="text-emerald-500 group-hover:text-emerald-600" />}
              label="FAQ"
              path="/dashboard/settings"
              active={location.pathname === '/dashboard/settings'}
              isCollapsed={isCollapsed}
            />
          </ul>
        </nav>

        {/* Branded Logout Button */}
        <div className="px-4 mb-1 py-1 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center w-full text-emerald-100 hover:text-emerald-600 font-medium group transition-colors duration-200"
          >
            <div className="py-1 ml-2 rounded-md group-hover:bg-emerald-50 transition-colors duration-200">
              <FaSignOutAlt className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600" />
            </div>
            {!isCollapsed && (
              <span className="ml-3 text-emerald-400 group-hover:text-emerald-700 transition-colors duration-200">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, path, active, isCollapsed }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <li>
      <div
        onClick={handleClick}
        className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${ active? 'bg-emerald-50 text-emerald-600 font-medium border-l-4 border-emerald-500':'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
        }`}>{isCollapsed ? (
          <span className="w-6 h-6 flex items-center justify-center">
            {React.cloneElement(icon, { 
              className: `${icon.props.className} group-hover:scale-110 transition-transform duration-200` 
            })}
          </span>
        ) : (
          <div className="flex items-center">
            <span className="group-hover:scale-110 transition-transform duration-200">
              {icon}
            </span>
            <span className="ml-3 group-hover:translate-x-1 transition-transform duration-200">
              {label}
            </span>
          </div>
        )}
      </div>
    </li>
  );
};

export default Sidebar;