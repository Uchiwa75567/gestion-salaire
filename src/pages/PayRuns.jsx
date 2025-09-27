import React from 'react';
import {
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PayRuns = () => {
  const { currentUser } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pay Runs</h1>
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Pay Run
          </button>
        )}
      </div>

      <div className="space-y-4">
        {[
          { period: 'December 2023', dates: 'Dec 1 - Dec 31, 2023', amount: '$12,500.00', status: 'Closed' },
          { period: 'January 2024', dates: 'Jan 1 - Jan 31, 2024', amount: '$11,800.00', status: 'Approved' },
          { period: 'February 2024', dates: 'Feb 1 - Feb 29, 2024', amount: '$13,200.00', status: 'Draft' },
          { period: 'March 2024', dates: 'Mar 1 - Mar 31, 2024', amount: '$12,900.00', status: 'Draft' },
        ].map((payrun) => (
          <div key={payrun.period} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{payrun.period}</h3>
                <p className="text-sm text-gray-600">{payrun.dates}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-lg">{payrun.amount}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    payrun.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                    payrun.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payrun.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayRuns;
