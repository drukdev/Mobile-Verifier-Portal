// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';

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
      <Sidebar onToggle={(isCollapsed) => setIsSidebarCollapsed(isCollapsed)} />

      <div className="flex-1 p-1 flex flex-col transition-all duration-300">
        <TopNavbar title={getTitleFromPath(location.pathname)} />

        <div className="flex-1 p-1 bg-white-500">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;