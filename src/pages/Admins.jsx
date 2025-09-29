import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Building2,
  Mail,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    email: '',
    role: 'ADMIN',
    companyId: null,
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchAdmins();
    fetchCompanies();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      console.log('Fetched users:', response.data);
      // Filter for admins only
      const adminUsers = response.data.filter(user => user.role === 'ADMIN') || [];
      setAdmins(adminUsers);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/company');
      console.log('Fetched companies for admins:', response.data);
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!formData.prenom.trim()) {
      errors.prenom = 'Le prénom est requis';
    }
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    }
    if (!formData.companyId || formData.companyId === null || formData.companyId === undefined) {
      errors.companyId = 'La société est requise';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    console.log('Sending create admin data:', JSON.stringify(formData, null, 2));
    setIsCreatingAdmin(true);
    try {
      const response = await api.post('/auth/create-user', formData);
      console.log('Create admin success:', response.data);
      setShowCreateModal(false);
      setFormData({ name: '', prenom: '', email: '', role: 'ADMIN', companyId: null });
      fetchAdmins();
      setSuccessMessage('Admin created successfully! A temporary password has been sent to their email.');
      setError(''); // Clear any previous errors
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Create admin error:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create admin');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/${selectedAdmin.id}`, formData);
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
      setSuccessMessage('Admin updated successfully!');
      setError(''); // Clear any previous errors
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to update admin');
    }
  };

  const handleDeleteAdmin = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    setIsDeletingAdmin(true);
    try {
      await api.delete(`/auth/users/${adminToDelete.id}`);
      setShowDeleteModal(false);
      setAdminToDelete(null);
      fetchAdmins();
      setSuccessMessage('Admin deleted successfully!');
      setError(''); // Clear any previous errors
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Delete admin error:', err);
      setError(err.response?.data?.message || 'Failed to delete admin');
      setShowDeleteModal(false);
      setAdminToDelete(null);
    } finally {
      setIsDeletingAdmin(false);
    }
  };

  const cancelDeleteAdmin = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  if (loading) {
    return <div className="p-6">Loading admins...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admins</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create Admin
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">All Admins</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {admins.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">No admins found</div>
          ) : (
            admins.map((admin) => (
              <div key={admin.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                    {admin.prenom?.charAt(0) || ''}{admin.name?.charAt(0) || ''}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {admin.prenom} {admin.name}
                    </p>
                    <p className="text-sm text-gray-600">Email: {admin.email}</p>
                    <p className="text-sm text-gray-600">
                      Company: {admin.company?.name || 'No company'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setFormData({
                        name: admin.name,
                        prenom: admin.prenom,
                        email: admin.email,
                        role: 'ADMIN',
                        companyId: admin.companyId,
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Admin</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {fieldErrors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.prenom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  value={formData.companyId || ''}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.companyId && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.companyId}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                    isCreatingAdmin ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCreatingAdmin ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Admin</h3>
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  value={formData.companyId || ''}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value ? parseInt(e.target.value) : null })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the admin <strong>{adminToDelete.name} {adminToDelete.prenom}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={cancelDeleteAdmin}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAdmin}
                disabled={isDeletingAdmin}
                className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                  isDeletingAdmin ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDeletingAdmin ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Admin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
