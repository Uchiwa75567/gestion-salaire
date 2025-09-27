import React from 'react';
import {
  BarChart3,
  CreditCard,
  Users,
  Download,
} from 'lucide-react';

const Reports = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <div className="flex space-x-2">
        <select className="border border-gray-300 rounded-lg px-3 py-2">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>
    </div>

    {/* Report Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payroll Summary</h3>
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Payroll:</span>
            <span className="font-semibold">$125,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes:</span>
            <span className="font-semibold">$18,750</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Net Pay:</span>
            <span className="font-semibold">$106,250</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <CreditCard className="h-6 w-6 text-green-600" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Bank Transfer:</span>
            <span className="font-semibold">65%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mobile Money:</span>
            <span className="font-semibold">25%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cash:</span>
            <span className="font-semibold">10%</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Employee Status</h3>
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Active:</span>
            <span className="font-semibold">148</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Inactive:</span>
            <span className="font-semibold">12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New Hires:</span>
            <span className="font-semibold">5</span>
          </div>
        </div>
      </div>
    </div>

    {/* Detailed Reports */}
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
                  Net Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { month: 'March 2024', employees: 150, gross: '$187,500', net: '$159,375', status: 'Completed' },
                { month: 'February 2024', employees: 148, gross: '$185,000', net: '$157,250', status: 'Completed' },
                { month: 'January 2024', employees: 145, gross: '$181,250', net: '$154,063', status: 'Completed' },
              ].map((report) => (
                <tr key={report.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.gross}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.net}
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

export default Reports;
