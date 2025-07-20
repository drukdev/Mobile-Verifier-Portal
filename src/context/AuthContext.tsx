import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    role: localStorage.getItem('userRole') || 'client',
    isLoading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const expiryTime = localStorage.getItem('authTokenExpiry');
    const storedRole = localStorage.getItem('userRole');

    if (token && expiryTime && new Date().getTime() < expiryTime) {
      setAuthState({
        isAuthenticated: true,
        role: storedRole || 'client',
        isLoading: false
      });
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTokenExpiry');
      localStorage.removeItem('userRole');
      setAuthState({
        isAuthenticated: false,
        role: 'client',
        isLoading: false
      });
    }
  }, []);

  const login = (token, expiryTime, userRole) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authTokenExpiry', expiryTime);
    localStorage.setItem('userRole', userRole);
    setAuthState({
      isAuthenticated: true,
      role: userRole,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiry');
    localStorage.removeItem('userRole');
    setAuthState({
      isAuthenticated: false,
      role: 'client',
      isLoading: false
    });
  };

  const value = useMemo(() => ({
    ...authState,
    login,
    logout
  }), [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}