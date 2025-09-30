import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEmployees, createEmployee, updateEmployee, activateEmployee, deactivateEmployee, deleteEmployee } from '../../services/api';

const Employees = () => {
  const { currentUser } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    contractType: 'FIXED',
    rateOrSalary: '',
    bankDetails: '',
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loadingEmployeeId, setLoadingEmployeeId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    }
    if (!formData.contractType) {
      errors.contractType = 'Contract Type is required';
    }
    if (!formData.rateOrSalary) {
      errors.rateOrSalary = 'Rate or Salary is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitting(false);
      return;
    }
    try {
      const data = {
        ...formData,
        rateOrSalary: parseFloat(formData.rateOrSalary) || 0,
      };
      await createEmployee(data);
      setShowAddModal(false);
      setFormData({ fullName: '', position: '', contractType: 'FIXED', rateOrSalary: '', bankDetails: '' });
      fetchEmployees(); // Refresh list
    } catch (error) {
      console.error('Error creating employee:', error);
      setError(error.response?.data?.error || 'Erreur lors de la création de l\'employé');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await deleteEmployee(id);
      fetchEmployees();
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      if (error.response?.status === 403) {
        setError('Accès refusé: Seuls les SUPERADMIN peuvent supprimer des employés');
      } else {
        setError('Erreur lors de la suppression de l\'employé');
      }
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };

  const confirmDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
    setLoadingEmployeeId(null); // Reset loading state when modal opens
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      fullName: employee.fullName || '',
      position: employee.position || '',
      contractType: employee.contractType || 'FIXED',
      rateOrSalary: employee.rateOrSalary || '',
      bankDetails: employee.bankDetails || '',
    });
    setFieldErrors({});
    setShowEditModal(true);
    setLoadingEmployeeId(null); // Reset loading state when modal opens
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    }
    if (!formData.contractType) {
      errors.contractType = 'Contract Type is required';
    }
    if (!formData.rateOrSalary) {
      errors.rateOrSalary = 'Rate or Salary is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitting(false);
      return;
    }
    try {
      const data = {
        ...formData,
        rateOrSalary: parseFloat(formData.rateOrSalary) || 0,
      };
      await updateEmployee(editingEmployee.id, data);
      setShowEditModal(false);
      setEditingEmployee(null);
      setFormData({ fullName: '', position: '', contractType: 'FIXED', rateOrSalary: '', bankDetails: '' });
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour de l\'employé');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Add Employee Modal
  const AddEmployeeModal = () => (
    <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Employee</h2>
          <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleAddEmployee} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.fullName && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.position ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.position && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.position}</p>
            )}
          </div>
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium text-gray-700">
              Contract Type <span className="text-red-500">*</span>
            </label>
            <select
              id="contractType"
              name="contractType"
              value={formData.contractType}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.contractType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select contract type</option>
              <option value="DAILY">Daily</option>
              <option value="FIXED">Fixed</option>
              <option value="FREELANCE">Freelance</option>
            </select>
            {fieldErrors.contractType && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.contractType}</p>
            )}
          </div>
          <div>
            <label htmlFor="rateOrSalary" className="block text-sm font-medium text-gray-700">
              Rate or Salary <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="rateOrSalary"
              name="rateOrSalary"
              value={formData.rateOrSalary}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.rateOrSalary ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.rateOrSalary && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.rateOrSalary}</p>
            )}
          </div>
          <div>
            <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700">
              Bank Details
            </label>
            <input
              type="text"
              id="bankDetails"
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Edit Employee Modal
  const EditEmployeeModal = () => (
    <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Employee</h2>
          <button onClick={() => {
            setShowEditModal(false);
            setLoadingEmployeeId(null);
          }} className="text-gray-600 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleUpdateEmployee} className="space-y-4" noValidate>
          <div>
            <label htmlFor="editFullName" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="editFullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.fullName && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>
          <div>
            <label htmlFor="editPosition" className="block text-sm font-medium text-gray-700">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="editPosition"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.position ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.position && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.position}</p>
            )}
          </div>
          <div>
            <label htmlFor="editContractType" className="block text-sm font-medium text-gray-700">
              Contract Type <span className="text-red-500">*</span>
            </label>
            <select
              id="editContractType"
              name="contractType"
              value={formData.contractType}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.contractType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select contract type</option>
              <option value="DAILY">Daily</option>
              <option value="FIXED">Fixed</option>
              <option value="FREELANCE">Freelance</option>
            </select>
            {fieldErrors.contractType && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.contractType}</p>
            )}
          </div>
          <div>
            <label htmlFor="editRateOrSalary" className="block text-sm font-medium text-gray-700">
              Rate or Salary <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="editRateOrSalary"
              name="rateOrSalary"
              value={formData.rateOrSalary}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${fieldErrors.rateOrSalary ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.rateOrSalary && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.rateOrSalary}</p>
            )}
          </div>
          <div>
            <label htmlFor="editBankDetails" className="block text-sm font-medium text-gray-700">
              Bank Details
            </label>
            <input
              type="text"
              id="editBankDetails"
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setLoadingEmployeeId(null);
              }}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-red-600">Delete Employee</h2>
          <button onClick={() => {
            setShowDeleteModal(false);
            setLoadingEmployeeId(null);
          }} className="text-gray-600 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete <strong>{employeeToDelete?.fullName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All data associated with this employee will be permanently removed.
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(false);
              setLoadingEmployeeId(null);
            }}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDeleteEmployee(employeeToDelete.id)}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete Employee
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showAddModal && <AddEmployeeModal />}
      {showEditModal && <EditEmployeeModal />}
      {showDeleteModal && <DeleteConfirmationModal />}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right ml-2 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') && (
            <button onClick={() => { setShowAddModal(true); setError(''); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
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
                  value={searchTerm}
                  onChange={handleSearchChange}
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
          {loading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No employees found</div>
          ) : (
            filteredEmployees.map((employee) => (
              <div key={employee.id} className="bg-white p-6 rounded-lg shadow cursor-pointer" onClick={() => window.location.href = `/employees/${employee.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                      {employee.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.fullName}</h3>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                      <p className="text-xs text-gray-500">{employee.contractType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{employee.rateOrSalary}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          employee.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setLoadingEmployeeId(employee.id);
                            handleEditEmployee(employee);
                          }}
                          className={`p-2 rounded ${
                            loadingEmployeeId === employee.id ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          disabled={loadingEmployeeId === employee.id}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setLoadingEmployeeId(employee.id);
                            confirmDeleteEmployee(employee);
                          }}
                          className={`p-2 rounded ${
                            loadingEmployeeId === employee.id ? 'text-red-400 bg-red-100 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'
                          }`}
                          disabled={loadingEmployeeId === employee.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setLoadingEmployeeId(employee.id);
                            if (employee.isActive) {
                              deactivateEmployee(employee.id).then(() => {
                                fetchEmployees();
                                setLoadingEmployeeId(null);
                              });
                            } else {
                              activateEmployee(employee.id).then(() => {
                                fetchEmployees();
                                setLoadingEmployeeId(null);
                              });
                            }
                          }}
                          className={`p-2 rounded ${
                            loadingEmployeeId === employee.id ? 'cursor-not-allowed opacity-50' :
                            employee.isActive ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'
                          }`}
                          title={employee.isActive ? 'Deactivate Employee' : 'Activate Employee'}
                          disabled={loadingEmployeeId === employee.id}
                        >
                          {employee.isActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Employees;
