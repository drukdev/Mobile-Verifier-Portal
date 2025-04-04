import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// 1. Create context separately (stable reference)
const AuthContext = createContext(null);

// 2. Named export for provider (required for Fast Refresh)
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const role = import.meta.env.VITE_ROLE;
  ///const role = 'admin'
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const expiryTime = localStorage.getItem('authTokenExpiry');

    if (token && expiryTime && new Date().getTime() < expiryTime) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTokenExpiry');
      setIsAuthenticated(false);
    }
  }, []);

  const login = (token, expiryTime) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authTokenExpiry', expiryTime);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiry');
    setIsAuthenticated(false);
  };

  // 3. Memoize context value (critical for performance)
  const value = useMemo(() => ({
    isAuthenticated,
    role,
    login,
    logout
  }), [isAuthenticated, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Named export for hook (required for Fast Refresh)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}