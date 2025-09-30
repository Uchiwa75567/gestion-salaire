import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployeeById } from '../../services/api';
import { ArrowLeft, User, Briefcase, Calendar, DollarSign } from 'lucide-react';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeById(id);
        setEmployee(res.data);
      } catch (err) {
        const msg = err?.response?.data?.error || err?.response?.data?.message || (err?.response?.status === 404 ? 'Employee not found' : 'Failed to load employee');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading employee...</div>;
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error || 'Employee not found'}</div>
        <button onClick={() => navigate('/employees')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Back to Employees</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/employees')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
            <p className="text-gray-600">Employee Details</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white mr-4">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Full Name</div>
              <div className="font-medium text-gray-900">{employee.fullName}</div>
            </div>
          </div>
          <Info label="Position" icon={<Briefcase className="h-5 w-5 text-gray-400" />} value={employee.position} />
          <Info label="Contract Type" icon={<Calendar className="h-5 w-5 text-gray-400" />} value={employee.contractType} />
          <Info label="Rate / Salary" icon={<DollarSign className="h-5 w-5 text-gray-400" />} value={employee.rateOrSalary} />
          <Info label="Active" icon={<Calendar className="h-5 w-5 text-gray-400" />} value={employee.isActive ? 'Yes' : 'No'} />
          {employee.bankDetails && <Info label="Bank Details" icon={<Calendar className="h-5 w-5 text-gray-400" />} value={employee.bankDetails} />}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, icon }) => (
  <div className="flex items-center">
    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3">
      {icon}
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{String(value)}</div>
    </div>
  </div>
);

export default EmployeeDetails;
