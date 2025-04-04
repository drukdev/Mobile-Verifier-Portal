import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';
import VerifierUser from './pages/VerifierUser';
import ProofTemplate from './pages/ProofTemplate';
import VerifierRole from './pages/VerifierRole';
import CreateOrganization from './pages/CreateOrganization';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/utils/PrivacyPolicy';
import TermsOfReference from './pages/utils/TermsOfReference';

const App = () => {
  const { isAuthenticated, role } = useAuth();
  console.log("App.js - isAuthenticated:", isAuthenticated, "Role:", role); // Debugging

  // Determine the default dashboard route based on role
  const getDefaultDashboardRoute = () => {
    if (!isAuthenticated) return "/login";
    
    switch(role) {
      case "client":
        return "/dashboard/verifier-role";
      case "admin":
        return "/dashboard/create-organization";
      default:
        return "/dashboard"; // Fallback for unknown roles
    }
  };

  return (
    <Router>
      <Routes>
        {/* Redirect to appropriate dashboard route if authenticated, otherwise to /login */}
        <Route path="/" element={<Navigate to={getDefaultDashboardRoute()} />} />

        {/* Login Route */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultDashboardRoute()} />} />

        {/* Dashboard Route with Nested Routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to={role === "client" ? "verifier-role" : "create-organization"} />} />
          <Route path="verifier-role" element={<VerifierRole />} />
          <Route path="verifier-user" element={<VerifierUser />} />
          <Route path="proof-templates" element={<ProofTemplate />} />
          <Route path="create-organization" element={<CreateOrganization />} />
          <Route path="settings" element={<Settings />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfReference />} />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to={getDefaultDashboardRoute()} />} />
      </Routes>
    </Router>
  );
};

export default App;