// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Extract the last part of the pathname and capitalize it
  const getTitleFromPath = (path) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard'; // Default title
    return segments[segments.length - 1]
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar onToggle={(isCollapsed) => setIsSidebarCollapsed(isCollapsed)} />

      {/* Main Content */}
      <div className="flex-1 p-1 flex flex-col transition-all duration-300">
        {/* Top Navbar with Dynamic Title */}
        <TopNavbar title={getTitleFromPath(location.pathname)} />

        {/* Dashboard Content */}
        <div className="flex-1 p-2 bg-white-500">
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;