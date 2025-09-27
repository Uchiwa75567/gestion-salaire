import React from 'react';
import {
  Download,
  Plus,
  Eye,
} from 'lucide-react';

const Payslips = ({ currentUser }) => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
      <div className="flex space-x-2">
        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </button>
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Generate Payslips
          </button>
        )}
      </div>
    </div>

    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">All Payslips</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {[
          { name: 'Ethan Carter', id: '12345', amount: '$5,500', avatar: 'EC' },
          { name: 'Olivia Bennett', id: '67890', amount: '$6,200', avatar: 'OB' },
          { name: 'Noah Thompson', id: '24680', amount: '$4,800', avatar: 'NT' },
          { name: 'Ava Harper', id: '13579', amount: '$5,900', avatar: 'AH' },
          { name: 'Liam Foster', id: '97531', amount: '$5,100', avatar: 'LF' },
          { name: 'Isabella Hayes', id: '86420', amount: '$6,500', avatar: 'IH' },
        ].map((payslip) => (
          <div key={payslip.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                {payslip.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-900">{payslip.name}</p>
                <p className="text-sm text-gray-600">Employee ID: {payslip.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="font-semibold text-lg">{payslip.amount}</p>
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
    </div>
  </div>
);

export default Payslips;
