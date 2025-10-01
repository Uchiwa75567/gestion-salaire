import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  Lock,
  Trash2,
  X,
  Search,
  Loader2,
  Calendar,
  FileText,
  User,
  DollarSign,
  AlertCircle,
  Filter,
} from 'lucide-react';
import {
  getPayRuns,
  getPayRunById,
  createPayRun,
  updatePayRun,
  approvePayRun,
  closePayRun,
  deletePayRun,
  getCompanies,
} from '../../services/api';

const STATUSES = ['DRAFT', 'APPROVED', 'CLOSED'];
const PERIOD_TYPES = ['MONTHLY', 'WEEKLY', 'DAILY', 'BI-WEEKLY'];

const PayRuns = () => {
  const { currentUser, impersonateCompanyId } = useAuth();

  // List state
  const [filters, setFilters] = useState({ status: '', periodType: '', companyId: '' });
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ 
    periodType: 'MONTHLY', 
    useCustomDates: false, 
    startDate: '', 
    endDate: '',
    companyId: ''
  });
  const [createErrors, setCreateErrors] = useState({});

  // Update modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, name: '', startDate: '', endDate: '' });
  const [editErrors, setEditErrors] = useState({});

  // Details modal state
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // Action loading per row
  const [rowLoading, setRowLoading] = useState({});

  useEffect(() => {
    fetchList();
    if (currentUser.role === 'SUPERADMIN') {
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.periodType, filters.companyId, impersonateCompanyId]);

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.periodType) params.periodType = filters.periodType;
      
      // Handle company filtering
      if (currentUser.role === 'SUPERADMIN') {
        if (impersonateCompanyId) {
          params.companyId = impersonateCompanyId;
        } else if (filters.companyId) {
          params.companyId = filters.companyId;
        }
      } else if (currentUser.role === 'ADMIN' && currentUser.companyId) {
        params.companyId = currentUser.companyId;
      }

      const res = await getPayRuns(params);
      setList(res.data || []);
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to load pay runs');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(pr =>
      (pr.name || '').toLowerCase().includes(q) ||
      (pr.periodType || '').toLowerCase().includes(q) ||
      (new Date(pr.startDate).toLocaleDateString()).toLowerCase().includes(q) ||
      (new Date(pr.endDate).toLocaleDateString()).toLowerCase().includes(q) ||
      String(pr.id).includes(q)
    );
  }, [list, search]);

  // Create
  const openCreate = () => {
    setCreateForm({ 
      periodType: 'MONTHLY', 
      useCustomDates: false, 
      startDate: '', 
      endDate: '',
      companyId: impersonateCompanyId || currentUser.companyId || ''
    });
    setCreateErrors({});
    setShowCreate(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!createForm.periodType) errs.periodType = 'Period type is required';
    
    // SUPERADMIN must select a company if not impersonating
    if (currentUser.role === 'SUPERADMIN' && !impersonateCompanyId && !createForm.companyId) {
      errs.companyId = 'Company is required';
    }
    
    if (createForm.useCustomDates) {
      if (!createForm.startDate) errs.startDate = 'Start date is required';
      if (!createForm.endDate) errs.endDate = 'End date is required';
      if (createForm.startDate && createForm.endDate && new Date(createForm.startDate) > new Date(createForm.endDate)) {
        errs.endDate = 'End date must be after start date';
      }
    }
    setCreateErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = { periodType: createForm.periodType };
    
    // Add companyId if SUPERADMIN and not impersonating
    if (currentUser.role === 'SUPERADMIN' && !impersonateCompanyId && createForm.companyId) {
      payload.companyId = parseInt(createForm.companyId);
    }
    
    if (createForm.useCustomDates) {
      payload.startDate = createForm.startDate;
      payload.endDate = createForm.endDate;
    }

    try {
      setCreating(true);
      await createPayRun(payload);
      setShowCreate(false);
      await fetchList();
      setError('');
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to create pay run');
      if (err?.response?.status === 400) {
        setCreateErrors({ general: msg });
      } else {
        setError(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  // Edit name and dates
  const openEdit = (pr) => {
    setEditForm({ 
      id: pr.id, 
      name: pr.name || '',
      startDate: pr.startDate ? pr.startDate.split('T')[0] : '',
      endDate: pr.endDate ? pr.endDate.split('T')[0] : ''
    });
    setEditErrors({});
    setShowEdit(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.name.trim()) errs.name = 'Name is required';
    if (editForm.startDate && editForm.endDate && new Date(editForm.startDate) > new Date(editForm.endDate)) {
      errs.endDate = 'End date must be after start date';
    }
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;
    
    try {
      setEditing(true);
      const payload = { name: editForm.name };
      if (editForm.startDate) payload.startDate = editForm.startDate;
      if (editForm.endDate) payload.endDate = editForm.endDate;
      
      await updatePayRun(editForm.id, payload);
      setShowEdit(false);
      await fetchList();
      if (selected && selected.id === editForm.id) {
        loadDetails(editForm.id);
      }
      setError('');
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to update pay run');
      if (err?.response?.status === 400) {
        setEditErrors({ general: msg });
      } else {
        setError(msg);
      }
    } finally {
      setEditing(false);
    }
  };

  // Details
  const openDetails = (id) => {
    setSelected(null);
    setShowDetails(true);
    loadDetails(id);
  };

  const loadDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const res = await getPayRunById(id);
      setSelected(res.data);
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to load pay run details');
      setError(msg);
      setShowDetails(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Row actions
  const doApprove = async (id) => {
    setRowLoading((s) => ({ ...s, [id]: true }));
    try {
      await approvePayRun(id);
      await fetchList();
      if (selected?.id === id) await loadDetails(id);
      setError('');
    } catch (err) {
      setError(mapHttpError(err, 'Failed to approve pay run'));
    } finally {
      setRowLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const doClose = async (id) => {
    setRowLoading((s) => ({ ...s, [id]: true }));
    try {
      await closePayRun(id);
      await fetchList();
      if (selected?.id === id) await loadDetails(id);
      setError('');
    } catch (err) {
      setError(mapHttpError(err, 'Failed to close pay run'));
    } finally {
      setRowLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pay run? This action cannot be undone.')) return;
    setRowLoading((s) => ({ ...s, [id]: true }));
    try {
      await deletePayRun(id);
      await fetchList();
      if (selected?.id === id) setShowDetails(false);
      setError('');
    } catch (err) {
      setError(mapHttpError(err, 'Failed to delete pay run'));
    } finally {
      setRowLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const canEdit = (status) => status === 'DRAFT';
  const canDelete = (role, status) => role === 'SUPERADMIN' && status === 'DRAFT';
  const canApprove = (status) => status === 'DRAFT';
  const canClose = (status) => status === 'APPROVED';

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pay Runs</h1>
          <p className="text-sm text-gray-600 mt-1">Manage payroll cycles and employee payslips</p>
        </div>
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') && (
          <button 
            onClick={openCreate} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Pay Run
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, id, date, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.periodType}
            onChange={(e) => setFilters((s) => ({ ...s, periodType: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Periods</option>
            {PERIOD_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {currentUser.role === 'SUPERADMIN' && !impersonateCompanyId && (
            <select
              value={filters.companyId}
              onChange={(e) => setFilters((s) => ({ ...s, companyId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Companies</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name || c.address}</option>)}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X className="h-4 w-4"/>
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          Loading pay runs...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">No pay runs found</p>
          <p className="text-sm mt-1">Create your first pay run to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((pr) => (
            <div key={pr.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{pr.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
                        {pr.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{pr.periodType}</span> • {new Date(pr.startDate).toLocaleDateString()} - {new Date(pr.endDate).toLocaleDateString()}
                    </p>
                    {pr.company && (
                      <p className="text-xs text-gray-500 mt-1">
                        Company: {pr.company.name || pr.company.address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Net Total</p>
                    <p className="font-bold text-lg text-gray-900">{formatMoney(pr.totalNet)}</p>
                    <p className="text-xs text-gray-500">{pr.payslips?.length || 0} payslips</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openDetails(pr.id)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="View details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {canEdit(pr.status) && (
                      <button 
                        onClick={() => openEdit(pr)} 
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => canApprove(pr.status) && doApprove(pr.id)}
                      disabled={!canApprove(pr.status) || rowLoading[pr.id]}
                      className={`p-2 rounded-lg transition-colors ${!canApprove(pr.status) || rowLoading[pr.id] ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`}
                      title="Approve"
                    >
                      {rowLoading[pr.id] ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => canClose(pr.status) && doClose(pr.id)}
                      disabled={!canClose(pr.status) || rowLoading[pr.id]}
                      className={`p-2 rounded-lg transition-colors ${!canClose(pr.status) || rowLoading[pr.id] ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Close"
                    >
                      {rowLoading[pr.id] ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                    </button>
                    {canDelete(currentUser.role, pr.status) && (
                      <button
                        onClick={() => doDelete(pr.id)}
                        disabled={rowLoading[pr.id]}
                        className={`p-2 rounded-lg transition-colors ${rowLoading[pr.id] ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                        title="Delete"
                      >
                        {rowLoading[pr.id] ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Pay Run</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitCreate} className="space-y-4">
              {currentUser.role === 'SUPERADMIN' && !impersonateCompanyId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <select
                    value={createForm.companyId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, companyId: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${createErrors.companyId ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name || c.address}</option>)}
                  </select>
                  {createErrors.companyId && <p className="text-red-500 text-sm mt-1">{createErrors.companyId}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Type *</label>
                <select
                  value={createForm.periodType}
                  onChange={(e) => setCreateForm((f) => ({ ...f, periodType: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${createErrors.periodType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  {PERIOD_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {createErrors.periodType && <p className="text-red-500 text-sm mt-1">{createErrors.periodType}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="useCustomDates"
                  type="checkbox"
                  checked={createForm.useCustomDates}
                  onChange={(e) => setCreateForm((f) => ({ ...f, useCustomDates: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="useCustomDates" className="text-sm text-gray-700">Use custom dates</label>
              </div>
              {createForm.useCustomDates && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm((f) => ({ ...f, startDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${createErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createErrors.startDate && <p className="text-red-500 text-sm mt-1">{createErrors.startDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm((f) => ({ ...f, endDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${createErrors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createErrors.endDate && <p className="text-red-500 text-sm mt-1">{createErrors.endDate}</p>}
                  </div>
                </div>
              )}
              {createErrors.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {createErrors.general}
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${creating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {creating ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : (<><Plus className="h-4 w-4 mr-2" />Create Pay Run</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Pay Run</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Pay Run Name"
                />
                {editErrors.name && <p className="text-red-500 text-sm mt-1">{editErrors.name}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editErrors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {editErrors.endDate && <p className="text-red-500 text-sm mt-1">{editErrors.endDate}</p>}
                </div>
              </div>
              {editErrors.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {editErrors.general}
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={editing} className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${editing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {editing ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Pay Run Details</h3>
              <button onClick={() => setShowDetails(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {detailsLoading || !selected ? (
              <div className="py-10 text-center text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading details...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Name" value={selected.name} />
                    <InfoRow label="Status" value={<span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selected.status)}`}>{selected.status}</span>} />
                    <InfoRow label="Period Type" value={selected.periodType} />
                    <InfoRow label="Period" value={`${new Date(selected.startDate).toLocaleDateString()} - ${new Date(selected.endDate).toLocaleDateString()}`} />
                    <InfoRow label="Total Gross" value={formatMoney(selected.totalGross)} />
                    <InfoRow label="Total Deductions" value={formatMoney(selected.totalDeductions)} />
                    <InfoRow label="Total Net" value={<span className="font-bold text-green-600">{formatMoney(selected.totalNet)}</span>} />
                    <InfoRow label="Payslips" value={`${selected.payslips?.length || 0} employees`} />
                  </div>
                </div>

                {/* Payslips Table */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-blue-600"/>
                    Employee Payslips ({selected.payslips?.length || 0})
                  </h4>
                  {(!selected.payslips || selected.payslips.length === 0) ? (
                    <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No payslips generated yet.</div>
                  ) : (
                    <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selected.payslips.map((ps) => (
                            <tr key={ps.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs font-medium">
                                    {ps.employee?.fullName?.charAt(0) || 'E'}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{ps.employee?.fullName || 'Employee'}</div>
                                    <div className="text-xs text-gray-500">ID: {ps.employee?.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{ps.employee?.position || '-'}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-700">{formatMoney(ps.grossSalary)}</td>
                              <td className="px-4 py-3 text-sm text-right text-red-600">-{formatMoney(ps.totalDeductions)}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatMoney(ps.netSalary)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs ${ps.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {ps.paymentStatus || 'PENDING'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {canEdit(selected.status) && (
                    <button onClick={() => { setShowDetails(false); openEdit(selected); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  )}
                  {canApprove(selected.status) && (
                    <button onClick={() => doApprove(selected.id)} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                  )}
                  {canClose(selected.status) && (
                    <button onClick={() => doClose(selected.id)} className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-lg flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Close
                    </button>
                  )}
                  {canDelete(currentUser.role, selected.status) && (
                    <button onClick={() => { setShowDetails(false); doDelete(selected.id); }} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-500 font-medium">{label}</div>
    <div className="font-medium text-gray-900 mt-1">{value}</div>
  </div>
);

const mapHttpError = (err, fallback) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.error || err?.response?.data?.message;
  if (status === 400) return apiMsg || 'Invalid data or duplicate entry';
  if (status === 401) return 'Session expired. Please login again.';
  if (status === 403) return 'Access denied. You do not have permission to perform this action.';
  if (status === 404) return 'Resource not found';
  return apiMsg || fallback;
};

const formatMoney = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
};

export default PayRuns;