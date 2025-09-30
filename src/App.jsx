import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './pages/Login/Login';
import HomePage from './pages/Home/Home';
import Companies from './pages/Companies/Companies';
import Admins from './pages/Admins';
import Employees from './pages/Employees/Employees';
import PayRuns from './pages/PayRuns/PayRuns';
import Payslips from './pages/Payslips/Payslips';
import Payments from './pages/Payments/Payments';
import Reports from './pages/Reports/Reports';
import SettingsPage from './pages/Settings/Settings';
import CompanyDetails from './pages/CompanyDetails/CompanyDetails';
import AdminDashboardByCompany from './pages/AdminDashboardByCompany/AdminDashboardByCompany';
import Layout from './components/layout/Layout';
import RoleSwitcher from './components/ui/RoleSwitcher';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { currentUser, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <Layout>
                <Companies />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies/:id"
          element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <Layout>
                <CompanyDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admins"
          element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <Layout>
                <Admins />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-view/company/:companyId"
          element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <Layout>
                <AdminDashboardByCompany />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Layout>
                <Employees />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payruns"
          element={
            <ProtectedRoute>
              <Layout>
                <PayRuns />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payslips"
          element={
            <ProtectedRoute>
              <Layout>
                <Payslips />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
      </Routes>
      {isAuthenticated() && <RoleSwitcher />}
    </>
  );
};

export default App;
