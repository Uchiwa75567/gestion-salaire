import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardByCompany = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { stopImpersonation } = useAuth();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      // Fetch company details
      const companyRes = await api.get(`/company/${companyId}`);
      setCompany(companyRes.data);

      // Fetch employees for this company
      const employeesRes = await api.get('/employees', {
        params: { companyId }
      });
      setEmployees(employeesRes.data || []);

      // Fetch payruns for this company
      const payrunsRes = await api.get('/payruns', {
        params: { companyId }
      });
      setPayruns(payrunsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Company not found'}
        </div>
        <button
          onClick={() => navigate('/companies')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.isActive).length,
    totalPayruns: payruns.length,
    completedPayruns: payruns.filter(pr => pr.status === 'CLOSED').length,
    totalPayroll: payruns.reduce((sum, pr) => sum + (pr.totalNet || 0), 0),
  };

  // Mock chart data
  const monthlyData = [
    { month: 'Jan', employees: 45, payroll: 225000 },
    { month: 'Feb', employees: 48, payroll: 240000 },
    { month: 'Mar', employees: 50, payroll: 250000 },
    { month: 'Apr', employees: 52, payroll: 260000 },
    { month: 'May', employees: 55, payroll: 275000 },
    { month: 'Jun', employees: 58, payroll: 290000 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              stopImpersonation();
              navigate('/companies');
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard - {company.name || company.address}</h1>
            <p className="text-gray-600">Company Overview & Analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Company ID: {companyId}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold">{stats.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{stats.activeEmployees} active</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Payroll</p>
              <p className="text-3xl font-bold">${stats.totalPayroll.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span>All time</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pay Runs</p>
              <p className="text-3xl font-bold">{stats.totalPayruns}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>{stats.completedPayruns} completed</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Active Rate</p>
              <p className="text-3xl font-bold">
                {stats.totalEmployees > 0 
                  ? ((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1) 
                  : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span>Employee activity</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Employee Growth */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Employee Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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
                dataKey="employees"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payroll Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Payroll Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
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
              <Bar dataKey="payroll" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Employees</h3>
          <button
            onClick={() => navigate('/employees')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All
          </button>
        </div>
        {employees.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No employees found</div>
        ) : (
          <div className="space-y-4">
            {employees.slice(0, 5).map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {emp.fullName?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{emp.fullName}</p>
                    <p className="text-sm text-gray-600">{emp.position}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${emp.rateOrSalary?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Pay Runs */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Pay Runs</h3>
          <button
            onClick={() => navigate('/payruns')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All
          </button>
        </div>
        {payruns.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No pay runs found</div>
        ) : (
          <div className="space-y-4">
            {payruns.slice(0, 5).map((pr) => (
              <div key={pr.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pr.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(pr.startDate).toLocaleDateString()} - {new Date(pr.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pr.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                    pr.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pr.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${pr.totalNet?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardByCompany;