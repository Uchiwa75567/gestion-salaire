import React from 'react';
import {
  BarChart3,
  Download,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { currentUser } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-2">
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Payroll', value: '$125,000', change: '+5.2%', icon: BarChart3 },
          { title: 'Active Employees', value: '150', change: '+2.1%', icon: BarChart3 },
          { title: 'Average Salary', value: '$833', change: '+3.8%', icon: BarChart3 },
        ].map((metric) => (
          <div key={metric.title} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-green-600">{metric.change}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <metric.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Salary Distribution</h3>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Salary ranges</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Department Breakdown</h3>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Department salaries</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[
              { name: 'Monthly Payroll Summary - January 2024', date: '2024-01-31', size: '2.4 MB' },
              { name: 'Employee Salary Report - Q4 2023', date: '2024-01-15', size: '1.8 MB' },
              { name: 'Tax Withholding Report - December 2023', date: '2024-01-10', size: '956 KB' },
            ].map((report) => (
              <div key={report.name} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                </div>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
