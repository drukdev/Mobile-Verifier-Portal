import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './components/layout/Dashboard';
import { useAuth } from './context/AuthContext';
import VerifierUser from './pages/VerifierUser';
import ProofTemplate from './pages/ProofTemplate';
import VerifierRole from './pages/VerifierRole';
import CreateOrganization from './pages/CreateOrganization';
import Settings from './pages/FAQ';
import PrivacyPolicy from './pages/utils/PrivacyPolicy';
import TermsOfReference from './pages/utils/TermsOfReference';
import LoadingSpinner from './components/layout/LoadingSpinner';
import FileUploadPage from './pages/FileUploadPage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Dashboard Route with Nested Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={role === "client" ? "verifier-role" : "create-organization"} replace />} />
          <Route path="verifier-role" element={<VerifierRole />} />
          <Route path="verifier-user" element={<VerifierUser />} />
          <Route path="proof-templates" element={<ProofTemplate />} />
          <Route path="create-organization" element={<CreateOrganization />} />
          <Route path="schema-upload" element={<FileUploadPage />} />
          <Route path="faq" element={<Settings />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfReference />} />
        </Route>

        {/* Root Redirect */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={isAuthenticated ? "/dashboard" : "/login"} 
              replace 
            />
          } 
        />

        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={isAuthenticated ? "/dashboard" : "/login"} 
              state={{ from: location }} 
              replace 
            />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;