import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  LayoutList,
  Grid,
  Check,
  AlertCircle,
  Search,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    currency: 'USD',
    periodType: 'MONTHLY',
    logo: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    currency: 'USD',
    periodType: 'MONTHLY',
    logo: null,
  });
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/company');
      console.log('Fetched companies:', response.data);
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();

    // Validation
    m

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('address', formData.address);
    data.append('currency', formData.currency);
    data.append('periodType', formData.periodType);
    if (formData.logo) {
      if (formData.logo.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Please select a valid image file (max 5MB)');
        return;
      }
      data.append('logo', formData.logo);
    }

    try {
      await api.post('/company/create', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        address: '',
        currency: 'USD',
        periodType: 'MONTHLY',
        logo: null,
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl('');
      setError('');
      setFieldErrors({});
      fetchCompanies();
    } catch (err) {
      console.error('Failed to create company:', err);
      setError('Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, logo: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setEditFormData({
      name: company.name || '',
      address: company.address || '',
      currency: company.currency || 'USD',
      periodType: company.periodType || 'MONTHLY',
      logo: null,
    });
    setEditPreviewUrl(company.logo || '');
    setEditFieldErrors({});
    setShowEditModal(true);
  };

  const handleDeleteCompany = async (id) => {
    setSelectedCompanyId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCompanyId) {
      setIsDeleting(true);
      try {
        await api.delete(`/company/${selectedCompanyId}`);
        setShowDeleteModal(false);
        setSelectedCompanyId(null);
        setError('');
        fetchCompanies();
      } catch (err) {
        console.error('Failed to delete company:', err);
        setError('Failed to delete company');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!editFormData.name.trim()) {
      errors.name = 'Company name is required';
    }
    if (!editFormData.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!editFormData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!editFormData.periodType) {
      errors.periodType = 'Period type is required';
    }

    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      return;
    }

    setEditFieldErrors({});
    setIsUpdating(true);

    const data = new FormData();
    data.append('name', editFormData.name);
    data.append('address', editFormData.address);
    data.append('currency', editFormData.currency);
    data.append('periodType', editFormData.periodType);
    if (editFormData.logo) {
      if (editFormData.logo.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Please select a valid image file (max 5MB)');
        return;
      }
      data.append('logo', editFormData.logo);
    }

    try {
      await api.put(`/company/${editingCompany.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowEditModal(false);
      setEditingCompany(null);
      setEditFormData({
        name: '',
        address: '',
        currency: 'USD',
        periodType: 'MONTHLY',
        logo: null,
      });
      if (editPreviewUrl && editPreviewUrl !== editingCompany.logo) {
        URL.revokeObjectURL(editPreviewUrl);
      }
      setEditPreviewUrl('');
      setError('');
      setEditFieldErrors({});
      fetchCompanies();
    } catch (err) {
      console.error('Failed to update company:', err);
      setError('Failed to update company');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    setEditFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditFormData(prev => ({ ...prev, logo: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
    } else {
      setEditPreviewUrl(editingCompany?.logo || '');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedCompanyId(null);
  };

  const filteredCompanies = companies.filter(company =>
    (company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.periodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.id.toString().includes(searchTerm)
  );

  if (loading) {
    return <div className="p-6">Loading companies...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setFieldErrors({});
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search companies by name, address, currency, period type, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredCompanies.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500 col-span-full">
            {searchTerm ? 'No companies match your search' : 'No companies found'}
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div key={company.id} className={viewMode === 'grid' ? 'bg-white p-6 rounded-lg shadow' : 'bg-white p-6 rounded-lg shadow flex items-start justify-between'}>
              {viewMode === 'grid' ? (
                <div>
                  <div className="relative mb-4">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name || company.address || 'Company'} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                        {(company.name || company.address || 'Company').charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{company.name || company.address}</h3>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">ID:</span> {company.id}</p>
                  {company.name && <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Name:</span> {company.name}</p>}
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Address:</span> {company.address}</p>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Currency:</span> {company.currency}</p>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Period Type:</span> {company.periodType}</p>
                  <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Created:</span> {new Date(company.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-2 mt-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      disabled={isDeleting}
                      className={`p-2 rounded ${
                        isDeleting
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="flex items-start space-x-4 flex-1 cursor-pointer"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name || company.address || 'Company'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-bold">
                          {(company.name || company.address || 'C').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{company.name || company.address}</h3>
                      <p className="text-sm text-gray-600">ID: {company.id}</p>
                      {company.name && <p className="text-sm text-gray-600">Name: {company.name}</p>}
                      <p className="text-sm text-gray-600">Address: {company.address}</p>
                      <p className="text-sm text-gray-600">Currency: {company.currency}</p>
                      <p className="text-sm text-gray-600">Period Type: {company.periodType}</p>
                      <p className="text-sm text-gray-600">Created: {new Date(company.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      disabled={isDeleting}
                      className={`p-2 rounded ${
                        isDeleting
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Company</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter company name"
                />
                {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter company address"
                />
                {fieldErrors.address && <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.currency ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="CFA">CFA</option>
                </select>
                {fieldErrors.currency && <p className="text-red-500 text-sm mt-1">{fieldErrors.currency}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
                <select
                  name="periodType"
                  value={formData.periodType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.periodType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI-WEEKLY">Bi-weekly</option>
                  <option value="DAILY">Daily</option>
                </select>
                {fieldErrors.periodType && <p className="text-red-500 text-sm mt-1">{fieldErrors.periodType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Image file, optional)</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload company logo (max 5MB, images only)</p>
                {previewUrl && (
                  <div className="mt-2">
                    <img 
                      src={previewUrl} 
                      alt="Logo preview" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
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
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Company'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Company</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editFieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter company name"
                />
                {editFieldErrors.name && <p className="text-red-500 text-sm mt-1">{editFieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editFieldErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter company address"
                />
                {editFieldErrors.address && <p className="text-red-500 text-sm mt-1">{editFieldErrors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={editFormData.currency}
                  onChange={handleEditInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editFieldErrors.currency ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="CFA">CFA</option>
                </select>
                {editFieldErrors.currency && <p className="text-red-500 text-sm mt-1">{editFieldErrors.currency}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
                <select
                  name="periodType"
                  value={editFormData.periodType}
                  onChange={handleEditInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editFieldErrors.periodType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI-WEEKLY">Bi-weekly</option>
                  <option value="DAILY">Daily</option>
                </select>
                {editFieldErrors.periodType && <p className="text-red-500 text-sm mt-1">{editFieldErrors.periodType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Image file, optional)</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload company logo (max 5MB, images only)</p>
                {editPreviewUrl && (
                  <div className="mt-2">
                    <img
                      src={editPreviewUrl}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                    isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Company'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this company? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isDeleting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
