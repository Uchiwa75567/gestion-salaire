import React from 'react';
import {
  Plus,
  Eye,
  Edit,
} from 'lucide-react';

const Companies = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
        <Plus className="h-4 w-4 mr-2" />
        Add Company
      </button>
    </div>

    <div className="space-y-4">
      {[
        { name: 'Acme Corp', currency: 'USD', employees: 45, status: 'active' },
        { name: 'Global Tech Solutions', currency: 'EUR', employees: 78, status: 'active' },
        { name: 'Innovate Dynamics', currency: 'GBP', employees: 23, status: 'active' },
        { name: 'Pinnacle Industries', currency: 'CAD', employees: 67, status: 'inactive' },
        { name: 'Vanguard Enterprises', currency: 'AUD', employees: 89, status: 'active' },
      ].map((company) => (
        <div key={company.name} className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
              {company.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{company.name}</h3>
              <p className="text-sm text-gray-600">{company.currency} • {company.employees} employees</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {company.status}
            </span>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Companies;
