import React from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="p-6 space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      {currentUser.role === 'SUPER_ADMIN' && (
        <select className="border border-gray-300 rounded-lg px-3 py-2">
          <option>All Companies</option>
          <option>Acme Corp</option>
          <option>Global Tech</option>
        </select>
      )}
    </div>

    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Payment Methods</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Amount Paid</p>
            <p className="text-2xl font-bold text-gray-900">$875K</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">$375K</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Active Employees</p>
            <p className="text-2xl font-bold text-gray-900">150</p>
          </div>
        </div>
      </div>
    </div>

    {/* Salary Evolution Chart */}
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Salary Mass Evolution</h3>
        <div className="flex items-center text-sm text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          +5%
        </div>
      </div>
      <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
        <p className="text-gray-500">Chart placeholder - Last 6 months: $1.25M</p>
      </div>
    </div>

    {/* Upcoming Payments */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Upcoming Payments</h3>
      <div className="space-y-4">
        {[
          { name: 'Ethan Harper', position: 'Engineering', amount: '$2,500' },
          { name: 'Olivia Bennett', position: 'Marketing', amount: '$3,000' },
          { name: 'Noah Carter', position: 'Sales', amount: '$2,800' },
          { name: 'Ava Mitchell', position: 'Product', amount: '$3,200' },
        ].map((payment) => (
          <div key={payment.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium">{payment.name}</p>
              <p className="text-sm text-gray-600">{payment.position}</p>
            </div>
            <p className="font-semibold">{payment.amount}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Home;
