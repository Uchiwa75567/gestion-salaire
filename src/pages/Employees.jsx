import React from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
} from 'lucide-react';

const Employees = ({ currentUser }) => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
      {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      )}
    </div>

    {/* Filters */}
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <select className="border border-gray-300 rounded-lg px-3 py-2">
          <option>Contract Type</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2">
          <option>Role</option>
          <option>Engineering</option>
          <option>Marketing</option>
          <option>Sales</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2">
          <option>Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
    </div>

    {/* Employee List */}
    <div className="space-y-4">
      {[
        { name: 'Ethan Harper', position: 'Software Engineer', type: 'Full-time', salary: '$95,000/year', status: 'Active' },
        { name: 'Olivia Bennett', position: 'Product Manager', type: 'Full-time', salary: '$110,000/year', status: 'Active' },
        { name: 'Noah Carter', position: 'Data Analyst', type: 'Part-time', salary: '$45/hour', status: 'Inactive' },
        { name: 'Ava Mitchell', position: 'UX Designer', type: 'Contract', salary: '$60/hour', status: 'Active' },
        { name: 'Liam Foster', position: 'Marketing Specialist', type: 'Full-time', salary: '$80,000/year', status: 'Active' },
      ].map((employee) => (
        <div key={employee.name} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.position}</p>
                <p className="text-xs text-gray-500">{employee.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{employee.salary}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    employee.status === 'Active' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  {employee.status}
                </span>
              </div>
              {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-100 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Employees;
