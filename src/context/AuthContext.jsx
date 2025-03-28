import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //const role = import.meta.env.VITE_ROLE;
  const role = 'client';

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken'); // Ensure this matches the key used in Login.jsx
    const expiryTime = localStorage.getItem('authTokenExpiry'); // Ensure this matches the key used in Login.jsx

    if (token && expiryTime && new Date().getTime() < expiryTime) {
      setIsAuthenticated(true);
    } else {
      // Clear invalid or expired tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTokenExpiry');
      setIsAuthenticated(false);
    }
  }, []);

  // Login function
  const login = (token, expiryTime) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authTokenExpiry', expiryTime);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiry');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);