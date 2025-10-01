import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Import all pages
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Companies from './pages/Companies/Companies';
import CompanyDetails from './pages/CompanyDetails/CompanyDetails';
import Admins from './pages/Admins';
import Employees from './pages/Employees/Employees';
import EmployeeDetails from './pages/Employees/EmployeeDetails';
import PayRuns from './pages/PayRuns/PayRuns';
import Payslips from './pages/Payslips/Payslips';
import Payments from './pages/Payments/Payments';
import Cashiers from './pages/Cashiers/Cashiers';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import AdminDashboardByCompany from './pages/AdminDashboardByCompany/AdminDashboardByCompany';

const AppPreview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Pages with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/dashboard" element={<Layout><Home /></Layout>} />
        <Route path="/companies" element={<Layout><Companies /></Layout>} />
        <Route path="/companies/:id" element={<Layout><CompanyDetails /></Layout>} />
        <Route path="/admins" element={<Layout><Admins /></Layout>} />
        <Route path="/employees" element={<Layout><Employees /></Layout>} />
        <Route path="/employees/:id" element={<Layout><EmployeeDetails /></Layout>} />
        <Route path="/payruns" element={<Layout><PayRuns /></Layout>} />
        <Route path="/payslips" element={<Layout><Payslips /></Layout>} />
        <Route path="/payments" element={<Layout><Payments /></Layout>} />
        <Route path="/cashiers" element={<Layout><Cashiers /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/admin-view/company/:companyId" element={<Layout><AdminDashboardByCompany /></Layout>} />
      </Routes>
    </div>
  );
};

export default AppPreview;