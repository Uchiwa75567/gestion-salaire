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
} from 'lucide-react';
import {
  getPayRuns,
  getPayRunById,
  createPayRun,
  updatePayRun,
  approvePayRun,
  closePayRun,
  deletePayRun,
} from '../../services/api';

const STATUSES = ['DRAFT', 'APPROVED', 'CLOSED'];
const PERIOD_TYPES = ['MONTHLY', 'WEEKLY', 'DAILY'];

const PayRuns = () => {
  const { currentUser } = useAuth();

  // List state
  const [filters, setFilters] = useState({ status: '', periodType: '' });
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ periodType: 'MONTHLY', useCustomDates: false, startDate: '', endDate: '' });
  const [createErrors, setCreateErrors] = useState({});

  // Update modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, name: '' });
  const [editErrors, setEditErrors] = useState({});

  // Details modal state
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // Action loading per row
  const [rowLoading, setRowLoading] = useState({});

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.periodType]);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.periodType) params.periodType = filters.periodType;
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
    setCreateForm({ periodType: 'MONTHLY', useCustomDates: false, startDate: '', endDate: '' });
    setCreateErrors({});
    setShowCreate(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!createForm.periodType) errs.periodType = 'Period type is required';
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
    if (createForm.useCustomDates) {
      payload.startDate = createForm.startDate;
      payload.endDate = createForm.endDate;
    }

    try {
      setCreating(true);
      await createPayRun(payload);
      setShowCreate(false);
      await fetchList();
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to create pay run');
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  // Edit name
  const openEdit = (pr) => {
    setEditForm({ id: pr.id, name: pr.name || '' });
    setEditErrors({});
    setShowEdit(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.name.trim()) errs.name = 'Name is required';
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      setEditing(true);
      await updatePayRun(editForm.id, { name: editForm.name });
      setShowEdit(false);
      await fetchList();
      if (selected && selected.id === editForm.id) {
        // refresh details if open
        loadDetails(editForm.id);
      }
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to update pay run');
      setError(msg);
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
    } catch (err) {
      setError(mapHttpError(err, 'Failed to close pay run'));
    } finally {
      setRowLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pay run? Only DRAFT can be deleted.')) return;
    setRowLoading((s) => ({ ...s, [id]: true }));
    try {
      await deletePayRun(id);
      await fetchList();
      if (selected?.id === id) setShowDetails(false);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to delete pay run'));
    } finally {
      setRowLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const canDelete = (role, status) => role === 'SUPERADMIN' && status === 'DRAFT';
  const canApprove = (status) => status === 'DRAFT';
  const canClose = (status) => status === 'APPROVED';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pay Runs</h1>
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') && (
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Pay Run
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
              placeholder="Search by name, id, date, type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.periodType}
            onChange={(e) => setFilters((s) => ({ ...s, periodType: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Periods</option>
            {PERIOD_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900"><X className="h-4 w-4"/></button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading pay runs...</div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No pay runs found</div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((pr) => (
            <div key={pr.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pr.name}</h3>
                    <p className="text-sm text-gray-600">
                      {pr.periodType} • {new Date(pr.startDate).toLocaleDateString()} - {new Date(pr.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">Net: {formatMoney(pr.totalNet)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      pr.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                      pr.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pr.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => openDetails(pr.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="View details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(pr)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Edit name">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => canApprove(pr.status) && doApprove(pr.id)}
                      disabled={!canApprove(pr.status) || rowLoading[pr.id]}
                      className={`p-2 rounded ${!canApprove(pr.status) || rowLoading[pr.id] ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-100'}`}
                      title="Approve"
                    >
                      {rowLoading[pr.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => canClose(pr.status) && doClose(pr.id)}
                      disabled={!canClose(pr.status) || rowLoading[pr.id]}
                      className={`p-2 rounded ${!canClose(pr.status) || rowLoading[pr.id] ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                      title="Close"
                    >
                      {rowLoading[pr.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    </button>
                    {(currentUser.role === 'SUPERADMIN') && (
                      <button
                        onClick={() => canDelete(currentUser.role, pr.status) && doDelete(pr.id)}
                        disabled={!canDelete(currentUser.role, pr.status) || rowLoading[pr.id]}
                        className={`p-2 rounded ${!canDelete(currentUser.role, pr.status) || rowLoading[pr.id] ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'}`}
                        title="Delete"
                      >
                        {rowLoading[pr.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Pay Run</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
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
                />
                <label htmlFor="useCustomDates" className="text-sm text-gray-700">Use custom dates</label>
              </div>
              {createForm.useCustomDates && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm((f) => ({ ...f, startDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${createErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createErrors.startDate && <p className="text-red-500 text-sm mt-1">{createErrors.startDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
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
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={creating} className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${creating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {creating ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Pay Run</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {editErrors.name && <p className="text-red-500 text-sm mt-1">{editErrors.name}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={editing} className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${editing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {editing ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pay Run Details</h3>
              <button onClick={() => setShowDetails(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {detailsLoading || !selected ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Name" value={selected.name} />
                  <InfoRow label="Status" value={selected.status} />
                  <InfoRow label="Period Type" value={selected.periodType} />
                  <InfoRow label="Period" value={`${new Date(selected.startDate).toLocaleDateString()} - ${new Date(selected.endDate).toLocaleDateString()}`} />
                  <InfoRow label="Total Gross" value={formatMoney(selected.totalGross)} />
                  <InfoRow label="Total Deductions" value={formatMoney(selected.totalDeductions)} />
                  <InfoRow label="Total Net" value={formatMoney(selected.totalNet)} />
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center"><FileText className="h-4 w-4 mr-2"/>Payslips ({selected.payslips?.length || 0})</h4>
                  {(!selected.payslips || selected.payslips.length === 0) ? (
                    <div className="text-gray-500">No payslips.</div>
                  ) : (
                    <div className="max-h-80 overflow-auto divide-y">
                      {selected.payslips.map((ps) => (
                        <div key={ps.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs">
                              <User className="h-4 w-4"/>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{ps.employee?.fullName || 'Employee'}</div>
                              <div className="text-xs text-gray-500">Payslip #{ps.id}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-700">Gross: {formatMoney(ps.grossSalary)}</div>
                            <div className="text-sm text-gray-700">Deductions: {formatMoney(ps.totalDeductions)}</div>
                            <div className="font-semibold">Net: {formatMoney(ps.netSalary)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <button onClick={() => openEdit(selected)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">Edit</button>
                  <button onClick={() => canApprove(selected.status) && doApprove(selected.id)} disabled={!canApprove(selected.status)} className={`px-3 py-2 rounded ${canApprove(selected.status) ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Approve</button>
                  <button onClick={() => canClose(selected.status) && doClose(selected.id)} disabled={!canClose(selected.status)} className={`px-3 py-2 rounded ${canClose(selected.status) ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Close</button>
                  {(currentUser.role === 'SUPERADMIN') && (
                    <button onClick={() => canDelete(currentUser.role, selected.status) && doDelete(selected.id)} disabled={!canDelete(currentUser.role, selected.status)} className={`px-3 py-2 rounded ${canDelete(currentUser.role, selected.status) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Delete</button>
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
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-medium text-gray-900">{value}</div>
  </div>
);

const mapHttpError = (err, fallback) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.error || err?.response?.data?.message;
  if (status === 400) return apiMsg || 'Invalid data';
  if (status === 401) return 'Session expired. Please login again.';
  if (status === 403) return 'Access denied';
  if (status === 404) return 'Resource not found';
  return apiMsg || fallback;
};

const formatMoney = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
};

export default PayRuns;
