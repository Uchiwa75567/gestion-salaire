import React, { useState } from 'react';
import {
  User,
  Building2,
  Home as HomeIcon,
  Users,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
} from 'lucide-react';

import Login from './pages/Login';
import HomePage from './pages/Home';
import Companies from './pages/Companies';
import Employees from './pages/Employees';
import PayRuns from './pages/PayRuns';
import Payslips from './pages/Payslips';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import Layout from './components/layout/Layout';
import RoleSwitcher from './components/ui/RoleSwitcher';

const App = () => {
  const [currentUser, setCurrentUser] = useState({
    role: 'SUPER_ADMIN', // SUPER_ADMIN, ADMIN, CASHIER
    name: 'John Doe',
    company: 'Acme Corp'
  });
  const [activeView, setActiveView] = useState('login');

  const handleLogin = () => {
    setActiveView('dashboard');
  };

  const renderPage = () => {
    switch(activeView) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return <HomePage currentUser={currentUser} />;
      case 'companies':
        return currentUser.role === 'SUPER_ADMIN' ? <Companies /> : <HomePage currentUser={currentUser} />;
      case 'employees':
        return <Employees currentUser={currentUser} />;
      case 'payruns':
        return <PayRuns currentUser={currentUser} />;
      case 'payslips':
        return <Payslips currentUser={currentUser} />;
      case 'payments':
        return <Payments currentUser={currentUser} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SettingsPage currentUser={currentUser} />;
      default:
        return <HomePage currentUser={currentUser} />;
    }
  };

  if (activeView === 'login') {
    return (
      <>
        {renderPage()}
        <RoleSwitcher currentUser={currentUser} setCurrentUser={setCurrentUser} />
      </>
    );
  }

  return (
    <>
      <Layout
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
      >
        {renderPage()}
      </Layout>
      <RoleSwitcher currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </>
  );
};

export default App;
