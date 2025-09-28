import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Home = () => {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payruns, setPayruns] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('Rendering Home, role:', currentUser?.role);

  useEffect(() => {
    fetchData();
  }, [currentUser?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch companies (always available)
      const companiesRes = await api.get('/company');
      setCompanies(companiesRes.data || []);

      // Try to fetch employees (may not exist yet)
      try {
        const employeesRes = await api.get('/employees');
        setEmployees(employeesRes.data || []);
      } catch (empErr) {
        if (empErr.response?.status !== 404) {
          console.error('Failed to fetch employees:', empErr);
        }
        // Use mock data if endpoint doesn't exist
        setEmployees([
          { id: 1, name: 'John Doe', position: 'Developer', salary: '5000', status: 'Active' },
          { id: 2, name: 'Jane Smith', position: 'Designer', salary: '4500', status: 'Active' },
          { id: 3, name: 'Bob Johnson', position: 'Manager', salary: '6000', status: 'Active' },
          { id: 4, name: 'Alice Brown', position: 'Analyst', salary: '4800', status: 'Active' },
        ]);
      }

      // Try to fetch payruns (may not exist yet)
      try {
        const payrunsRes = await api.get('/payruns');
        setPayruns(payrunsRes.data || []);
      } catch (payErr) {
        if (payErr.response?.status !== 404) {
          console.error('Failed to fetch payruns:', payErr);
        }
        // Use mock data if endpoint doesn't exist
        setPayruns([
          { id: 1, amount: '$5000', employeeId: 1 },
          { id: 2, amount: '$4500', employeeId: 2 },
          { id: 3, amount: '$6000', employeeId: 3 },
          { id: 4, amount: '$4800', employeeId: 4 },
        ]);
      }
    } catch (err) {
      // Only show error if it's not a 404 (which we handle gracefully)
      if (err.response?.status !== 404) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dynamic line chart data: Group by month from createdAt
  const lineChartData = React.useMemo(() => {
    if (!companies.length) return [];

    const monthlyCounts = {};
    companies.forEach(company => {
      if (company.createdAt) {
        const date = new Date(company.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });

    // Sort by month order (Jan to Dec)
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.map(month => ({
      month,
      companies: monthlyCounts[month] || 0
    })).filter(item => item.companies > 0); // Only show months with data
  }, [companies]);

  // Dynamic pie chart data: Count active vs deleted
  const pieChartData = React.useMemo(() => {
    if (!companies.length) return [];

    const statusCounts = companies.reduce((acc, company) => {
      const status = company.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: name === 'active' ? '#10B981' : '#EF4444'
    }));
  }, [companies]);

  // Dynamic metrics
  const metrics = React.useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const totalPayruns = payruns.length;
    const totalAmount = payruns.reduce((sum, payrun) => {
      const amount = typeof payrun.amount === 'string'
        ? parseFloat(payrun.amount.replace(/[$,]/g, ''))
        : payrun.amount || 0;
      return sum + amount;
    }, 0);
    const upcomingPayments = employees.slice(0, 4); // Mock upcoming payments

    return {
      totalEmployees,
      activeEmployees,
      totalPayruns,
      totalAmount,
      upcomingPayments,
    };
  }, [employees, payruns]);

  // Salary evolution chart data
  const salaryChartData = React.useMemo(() => {
    // Mock data for last 6 months
    return [
      { month: 'Jan', amount: 1200000 },
      { month: 'Feb', amount: 1250000 },
      { month: 'Mar', amount: 1180000 },
      { month: 'Apr', amount: 1320000 },
      { month: 'May', amount: 1280000 },
      { month: 'Jun', amount: 1350000 },
    ];
  }, []);

  if (currentUser.role === 'SUPERADMIN') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center text-gray-500">
              Loading dashboard data...
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-red-600 text-center">{error}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System overview and analytics</p>
            </div>

          </div>

          {/* Key Metrics for Super Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Companies</p>
                  <p className="text-3xl font-bold">{companies.length}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-200" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+18% from last month</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Companies</p>
                  <p className="text-3xl font-bold">{companies.filter(c => c.status !== 'deleted').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-200" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>{((companies.filter(c => c.status !== 'deleted').length / companies.length) * 100).toFixed(1)}% active rate</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium">System Health</p>
                  <p className="text-3xl font-bold">98%</p>
                </div>
                <Activity className="h-8 w-8 text-rose-200" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Creation Trend Line Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Company Creation Trend</h3>
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5%
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData.length > 0 ? lineChartData : [{ month: 'No Data', companies: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="companies"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Company Status Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Company Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData.length > 0 ? pieChartData : [{ name: 'No Data', value: 1, color: '#8884d8' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Companies */}
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Companies</h3>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {companies.slice(0, 5).map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(company.name || company.address || 'C').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{company.name || company.address}</p>
                      <p className="text-sm text-gray-600">{company.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {company.status || 'active'}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{new Date(company.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modern UI for other roles
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center text-gray-500">
            Loading dashboard data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="text-red-600 text-center">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser?.name || 'User'}</p>
          </div>

        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold">{metrics.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Employees</p>
                <p className="text-3xl font-bold">{metrics.activeEmployees}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="h-4 w-4 mr-1" />
              <span>{((metrics.activeEmployees / metrics.totalEmployees) * 100).toFixed(1)}% active rate</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Pay Runs</p>
                <p className="text-3xl font-bold">{metrics.totalPayruns}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Amount Paid</p>
                <p className="text-3xl font-bold">${metrics.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+15% from last month</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salary Evolution Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Salary Mass Evolution</h3>
              <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5.2%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salaryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Employee Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: metrics.activeEmployees, color: '#10b981' },
                    { name: 'Inactive', value: metrics.totalEmployees - metrics.activeEmployees, color: '#ef4444' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Active', value: metrics.activeEmployees, color: '#10b981' },
                    { name: 'Inactive', value: metrics.totalEmployees - metrics.activeEmployees, color: '#ef4444' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Upcoming Payments</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {metrics.upcomingPayments.map((employee, index) => (
              <div key={employee.id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {employee.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{employee.name || 'Employee'}</p>
                    <p className="text-sm text-gray-600">{employee.position || 'Position'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">${employee.salary || '0'}</p>
                  <p className="text-sm text-gray-500">Next payday</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
