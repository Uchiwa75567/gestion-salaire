import React from 'react';
import {
  CreditCard,
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
  const { currentUser } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { type: 'Bank Transfer', last4: '****1234', status: 'Active', balance: '$25,000' },
          { type: 'Credit Card', last4: '****5678', status: 'Active', balance: '$15,000' },
          { type: 'PayPal', last4: '****9012', status: 'Inactive', balance: '$0' },
        ].map((payment) => (
          <div key={payment.last4} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">{payment.type}</p>
                  <p className="text-sm text-gray-600">{payment.last4}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                payment.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {payment.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">{payment.balance}</p>
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
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[
              { date: '2024-01-15', description: 'Salary Payment - Ethan Carter', amount: '-$5,500', status: 'Completed' },
              { date: '2024-01-15', description: 'Salary Payment - Olivia Bennett', amount: '-$6,200', status: 'Completed' },
              { date: '2024-01-14', description: 'Salary Payment - Noah Thompson', amount: '-$4,800', status: 'Pending' },
            ].map((transaction) => (
              <div key={transaction.date + transaction.description} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className={`font-semibold ${transaction.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.amount}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
