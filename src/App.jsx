// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';
import VerifierUser from './pages/VerifierUser';
import ProofTemplate from './pages/ProofTemplate';
import VerifierRole from './pages/VerifierRole';
import CreateOrganization from './pages/CreateOrganization';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Redirect to /dashboard if authenticated, otherwise to /login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

        {/* Login Route */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Dashboard Route with Nested Routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}>
          <Route path="verifier-role" element={<VerifierRole />} />
          <Route path="verifier-user" element={<VerifierUser />} />
          <Route path="proof-templates" element={<ProofTemplate />} />
          <Route path="create-organization" element={<CreateOrganization />} />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
    
  );
};

export default App;