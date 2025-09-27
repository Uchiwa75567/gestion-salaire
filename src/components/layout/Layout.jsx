import React from 'react';
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
} from 'lucide-react';

const Layout = ({ children, currentUser, activeView, setActiveView }) => {
  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
    ];

    if (currentUser.role === 'SUPER_ADMIN') {
      return [
        ...commonItems,
        { id: 'companies', icon: Building2, label: 'Companies' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'employees', icon: User, label: 'Employees' },
        { id: 'payruns', icon: Calendar, label: 'Pay Runs' },
        { id: 'payslips', icon: FileText, label: 'Payslips' },
        { id: 'payments', icon: CreditCard, label: 'Payments' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ];
    }

    if (currentUser.role === 'ADMIN') {
      return [
        ...commonItems,
        { id: 'employees', icon: User, label: 'Employees' },
        { id: 'payruns', icon: Calendar, label: 'Pay Runs' },
        { id: 'payslips', icon: FileText, label: 'Payslips' },
        { id: 'payments', icon: CreditCard, label: 'Payments' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ];
    }

    // CASHIER
    return [
      ...commonItems,
      { id: 'employees', icon: User, label: 'Employees', readonly: true },
      { id: 'payslips', icon: FileText, label: 'Payslips', readonly: true },
      { id: 'payments', icon: CreditCard, label: 'Payments' },
      { id: 'reports', icon: BarChart3, label: 'Reports' },
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
                  return (
                    <button
                      key={item.id}
                      onClick={() => !item.readonly && setActiveView(item.id)}
                      className={`${
                        activeView === item.id
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                        item.readonly ? 'opacity-60' : ''
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
            <div className="flex-shrink-0 flex bg-gray-800 p-4">
              <div className="flex-shrink-0 group block">
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
            <h1 className="font-semibold">{getViewTitle(activeView)}</h1>
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

const getViewTitle = (activeView) => {
  const titles = {
    dashboard: 'Dashboard',
    companies: 'Companies',
    employees: 'Employees',
    payruns: 'Pay Runs',
    payslips: 'Payslips',
    payments: 'Payments',
    reports: 'Reports',
    settings: 'Settings'
  };
  return titles[activeView] || 'Dashboard';
};

export default Layout;
