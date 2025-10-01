import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CreditCard,
  Users,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Reports = () => {
  const { currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('THIS_MONTH');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [payruns, setPayruns] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, payrunRes] = await Promise.all([
        api.get('/employees'),
        api.get('/payruns')
      ]);
      setEmployees(empRes.data || []);
      setPayruns(payrunRes.data || []);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const monthlyPayrollData = [
    { month: 'Jan', amount: 181250 },
    { month: 'Feb', amount: 185000 },
    { month: 'Mar', amount: 187500 },
    { month: 'Apr', amount: 190000 },
    { month: 'May', amount: 188500 },
    { month: 'Jun', amount: 192000 },
  ];

  const paymentMethodsData = [
    { name: 'Bank Transfer', value: 65, color: '#3B82F6' },
    { name: 'Mobile Money', value: 25, color: '#10B981' },
    { name: 'Cash', value: 10, color: '#F59E0B' },
  ];

  const departmentData = [
    { department: 'Engineering', employees: 45, payroll: 225000 },
    { department: 'Marketing', employees: 20, payroll: 100000 },
    { department: 'Sales', employees: 35, payroll: 175000 },
    { department: 'HR', employees: 15, payroll: 75000 },
    { department: 'Operations', employees: 35, payroll: 175000 },
  ];

  const stats = {
    totalPayroll: payruns.reduce((sum, pr) => sum + (pr.totalNet || 0), 0),
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.isActive).length,
    averageSalary: employees.length > 0 
      ? employees.reduce((sum, e) => sum + (e.rateOrSalary || 0), 0) / employees.length 
      : 0,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="THIS_QUARTER">This Quarter</option>
            <option value="THIS_YEAR">This Year</option>
          </select>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Payroll</p>
              <p className="text-3xl font-bold">${stats.totalPayroll.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+5.2% from last period</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold">{stats.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-green-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+3 new hires</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Employees</p>
              <p className="text-3xl font-bold">{stats.activeEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span>{((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1)}% active rate</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Salary</p>
              <p className="text-3xl font-bold">${stats.averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-200" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span>Per employee</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Payroll Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Monthly Payroll Trend</h3>
            <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="h-4 w-4 mr-1" />
              +5.2%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPayrollData}>
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

        {/* Payment Methods Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentMethodsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Analysis */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Department Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="department" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="employees" fill="#3b82f6" name="Employees" />
            <Bar dataKey="payroll" fill="#10b981" name="Payroll ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Reports Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Monthly Payroll Reports</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { month: 'March 2024', employees: 150, gross: 187500, deductions: 28125, net: 159375, status: 'Completed' },
                  { month: 'February 2024', employees: 148, gross: 185000, deductions: 27750, net: 157250, status: 'Completed' },
                  { month: 'January 2024', employees: 145, gross: 181250, deductions: 27187, net: 154063, status: 'Completed' },
                ].map((report) => (
                  <tr key={report.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${report.gross.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${report.deductions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${report.net.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;