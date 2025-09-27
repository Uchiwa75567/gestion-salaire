import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Building2,
  Home,
  Users,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
    ];

    if (currentUser.role === 'SUPER_ADMIN') {
      return [
        ...commonItems,
        { path: '/companies', icon: Building2, label: 'Companies' },
        { path: '/employees', icon: Users, label: 'Employees' },
        { path: '/payruns', icon: Calendar, label: 'Pay Runs' },
        { path: '/payslips', icon: FileText, label: 'Payslips' },
        { path: '/payments', icon: CreditCard, label: 'Payments' },
        { path: '/reports', icon: BarChart3, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    if (currentUser.role === 'ADMIN') {
      return [
        ...commonItems,
        { path: '/employees', icon: User, label: 'Employees' },
        { path: '/payruns', icon: Calendar, label: 'Pay Runs' },
        { path: '/payslips', icon: FileText, label: 'Payslips' },
        { path: '/payments', icon: CreditCard, label: 'Payments' },
        { path: '/reports', icon: BarChart3, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // CASHIER
    return [
      ...commonItems,
      { path: '/employees', icon: User, label: 'Employees', readonly: true },
      { path: '/payslips', icon: FileText, label: 'Payslips', readonly: true },
      { path: '/payments', icon: CreditCard, label: 'Payments' },
      { path: '/reports', icon: BarChart3, label: 'Reports' },
    ];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gray-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Building2 className="h-8 w-8 text-white" />
                <span className="ml-2 text-white font-semibold">PayrollPro</span>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {getMenuItems().map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => !item.readonly && navigate(item.path)}
                      className={`${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                        item.readonly ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <Icon className="mr-3 h-6 w-6" />
                      {item.label}
                      {item.readonly && <span className="ml-auto text-xs">(View)</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex flex-col bg-gray-800 p-4">
              <div className="flex-shrink-0 group block mb-4">
                <div className="flex items-center">
                  <div className="inline-block h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-300">{currentUser.role}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <button className="p-2">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-semibold">{getViewTitle(location.pathname)}</h1>
            <div className="w-8" />
          </div>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const getViewTitle = (pathname) => {
  const pathToTitle = {
    '/dashboard': 'Dashboard',
    '/companies': 'Companies',
    '/employees': 'Employees',
    '/payruns': 'Pay Runs',
    '/payslips': 'Payslips',
    '/payments': 'Payments',
    '/reports': 'Reports',
    '/settings': 'Settings'
  };
  return pathToTitle[pathname] || 'Dashboard';
};

export default Layout;
