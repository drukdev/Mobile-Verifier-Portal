// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const role = import.meta.env.VITE_ROLE;

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiryTime = localStorage.getItem('expiryTime');

    if (token && expiryTime && new Date().getTime() < expiryTime) {
      setIsAuthenticated(true);
    } else {
      // Clear invalid or expired tokens
      localStorage.removeItem('token');
      localStorage.removeItem('expiryTime');
      setIsAuthenticated(false);
    }
  }, []);

  // Login function
  const login = (token, expiryTime) => {
    localStorage.setItem('token', token);
    localStorage.setItem('expiryTime', expiryTime);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiryTime');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children} {/* Render children here */}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);