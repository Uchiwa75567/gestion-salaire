import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  UserCheck,
  Edit,
  Trash2,
  Plus,
  Mail,
  Phone,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);

      // Fetch company details
      const companyRes = await api.get(`/company/${id}`);
      setCompany(companyRes.data);

      // Fetch employees for this company
      try {
        const employeesRes = await api.get(`/employees?companyId=${id}`);
        setEmployees(employeesRes.data || []);
      } catch (empErr) {
        console.error('Failed to fetch employees:', empErr);
        setEmployees([]);
      }

      // Fetch admins for this company by fetching all users and filtering client-side
      try {
        const usersRes = await api.get('/auth/users');
        const adminsForCompany = (usersRes.data || []).filter(
          (u) => (u.role === 'ADMIN' || u.role === 'CAISSIER') && u.companyId === Number(id)
        );
        setAdmins(adminsForCompany);
      } catch (adminErr) {
        console.error('Failed to fetch admins:', adminErr);
        setAdmins([]);
      }

    } catch (err) {
      console.error('Failed to fetch company details:', err);
      setError('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = () => {
    // Navigate to edit company page or open edit modal
    navigate(`/companies/edit/${id}`);
  };

  const handleDeleteCompany = () => {
    // Handle delete company
    if (window.confirm('Are you sure you want to delete this company?')) {
      // Implement delete logic
    }
  };

  const handleAddEmployee = () => {
    navigate(`/employees/new?companyId=${id}`);
  };

  const handleAddAdmin = () => {
    navigate(`/admins/new?companyId=${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading company details...</div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Company not found'}
        </div>
        <button
          onClick={() => navigate('/companies')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/companies')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name || company.address}</h1>
            <p className="text-gray-600">Company Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEditCompany}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Company
          </button>
          <button
            onClick={() => { startImpersonation(Number(id)); navigate('/employees'); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            Voir l'interface de l'admin
          </button>
          <button
            onClick={handleDeleteCompany}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Company
          </button>
        </div>
      </div>

      {/* Company Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.isActive).length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
            <Building className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Currency</p>
              <p className="text-2xl font-bold text-gray-900">{company.currency}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <Building className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Company Name:</span>
              <span className="ml-2">{company.name || 'N/A'}</span>
            </div>
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Address:</span>
              <span className="ml-2">{company.address}</span>
            </div>
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Currency:</span>
              <span className="ml-2">{company.currency}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Period Type:</span>
              <span className="ml-2">{company.periodType}</span>
            </div>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Created:</span>
              <span className="ml-2">{new Date(company.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center mb-4">
              <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Status:</span>
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {company.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Employees ({employees.length})</h2>
          <button
            onClick={handleAddEmployee}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>

        {employees.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No employees found for this company.
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {employee.fullName?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee.fullName || 'Employee'}</p>
                    <p className="text-sm text-gray-600">{employee.position || 'Position'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admins Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Admins ({admins.length})</h2>
          <button
            onClick={handleAddAdmin}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No admins found for this company.
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {admin.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{admin.name || 'Admin'}</p>
                    <p className="text-sm text-gray-600">{admin.email || 'Email'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Admin
                  </span>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
