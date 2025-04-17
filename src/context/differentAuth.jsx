import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const role = import.meta.env.VITE_ROLE;



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
    localStorage.removeItem('webhookToken');
    setIsAuthenticated(false);
  };

  const webhookAuth = () => {
    const auth_api_url = import.meta.env.VITE_AUTH_API_URL;
    const clientId = import.meta.env.VITE_WEBHOOK_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_WEBHOOK_CLIENT_SECRET;

    if (!auth_api_url || !clientId || !clientSecret) {
      throw new Error('Missing environment variables for authentication');
    }
    const payload = JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      })

    return fetch(`${auth_api_url}/authentication/v1/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }
        return response.json();
      })
      .then(data => {
        const { access_token } = data;
        localStorage.setItem('webhookToken', access_token);
      });
  }

  const value = useMemo(() => ({
    isAuthenticated,
    role,
    login,
    logout,
    webhookAuth,
  }), [isAuthenticated, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}