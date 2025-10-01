import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Eye,
  Search,
  Filter,
  FileText,
  Calendar,
  DollarSign,
  User,
  X,
  Loader2,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { getPayRuns } from '../../services/api';

const STATUSES = ['PENDING', 'PARTIAL', 'PAID'];

const Payslips = () => {
  const { currentUser } = useAuth();

  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRunId, setSelectedPayRunId] = useState('');
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Details modal
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editForm, setEditForm] = useState({ id: null, notes: '', deductions: [] });

  // Row loading
  const [rowLoading, setRowLoading] = useState({});

  const canAccess = currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'ADMIN';
  const canEdit = useMemo(() => {
    if (!selectedPayslip) return false;
    const prStatus = selectedPayslip?.payRun?.status;
    return canAccess && prStatus === 'DRAFT';
  }, [canAccess, selectedPayslip]);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    loadPayRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  useEffect(() => {
    if (!canAccess) return;
    loadPayslips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPayRunId, employeeIdFilter]);

  const loadPayRuns = async () => {
    try {
      const res = await getPayRuns();
      const data = Array.isArray(res.data) ? res.data : [];
      setPayRuns(data);
      if (!selectedPayRunId && data.length > 0) {
        setSelectedPayRunId(String(data[0].id));
      }
    } catch (err) {
      setError(mapHttpError(err, 'Failed to load pay runs'));
    }
  };

  const loadPayslips = async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (employeeIdFilter) {
        res = await api.get(`/payslips/employee/${employeeIdFilter}`);
      } else if (selectedPayRunId) {
        res = await api.get(`/payslips/payrun/${selectedPayRunId}`);
      } else {
        setPayslips([]);
        setLoading(false);
        return;
      }
      setPayslips(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to load payslips'));
    } finally {
      setLoading(false);
    }
  };

  const filteredPayslips = useMemo(() => {
    let list = payslips;
    if (statusFilter) {
      list = list.filter((p) => p.paymentStatus === statusFilter);
    }
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((p) => {
      const emp = p.employee?.fullName || '';
      const idStr = String(p.id || '');
      const period = `${safeDate(p.payRun?.startDate)} - ${safeDate(p.payRun?.endDate)}`;
      return emp.toLowerCase().includes(q) || idStr.includes(q) || period.toLowerCase().includes(q);
    });
  }, [payslips, statusFilter, searchTerm]);

  // Details
  const openDetails = async (id) => {
    setShowDetails(true);
    setSelectedPayslip(null);
    try {
      setDetailsLoading(true);
      const res = await api.get(`/payslips/${id}`);
      setSelectedPayslip(res.data);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to load payslip details'));
      setShowDetails(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Edit
  const startEdit = () => {
    if (!selectedPayslip) return;
    setEditErrors({});
    setEditForm({ id: selectedPayslip.id, notes: selectedPayslip.notes || '', deductions: [...(selectedPayslip.deductions || [])] });
    setShowEdit(true);
  };

  const addDeductionRow = () => {
    setEditForm((f) => ({ ...f, deductions: [...f.deductions, { label: '', amount: '' }] }));
  };

  const removeDeductionRow = (idx) => {
    setEditForm((f) => ({ ...f, deductions: f.deductions.filter((_, i) => i !== idx) }));
  };

  const updateDeduction = (idx, key, value) => {
    setEditForm((f) => {
      const deds = [...f.deductions];
      deds[idx] = { ...deds[idx], [key]: key === 'amount' ? value : value };
      return { ...f, deductions: deds };
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    // validate
    const cleaned = editForm.deductions.map((d) => ({ label: (d.label || '').trim(), amount: Number(d.amount || 0) }));
    if (cleaned.some((d) => !d.label)) errs.deductions = 'All deduction labels are required';
    if (cleaned.some((d) => isNaN(d.amount) || d.amount < 0)) errs.deductions = 'Amounts must be >= 0';

    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setEditSubmitting(true);
      const payload = { deductions: cleaned, notes: editForm.notes || undefined };
      await api.put(`/payslips/${editForm.id}`, payload);
      setShowEdit(false);
      // refresh details and list
      await openDetails(editForm.id);
      await loadPayslips();
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to update payslip');
      if ([400, 409].includes(err?.response?.status)) setEditErrors((e) => ({ ...e, general: msg }));
      else setError(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // PDFs
  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPayslipPDF = async (id) => {
    setRowLoading((s) => ({ ...s, [id]: true }));
    try {
      const res = await api.get(`/payslips/${id}/pdf`, { responseType: 'blob' });
      saveBlob(new Blob([res.data], { type: 'application/pdf' }), `bulletin-paie-${id}.pdf`);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to download payslip PDF'));
    } finally {
      setRowLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const downloadPayRunPDF = async () => {
    if (!selectedPayRunId) {
      setError('Select a pay run');
      return;
    }
    try {
      const res = await api.get(`/payslips/payrun/${selectedPayRunId}/pdf`, { responseType: 'blob' });
      saveBlob(new Blob([res.data], { type: 'application/pdf' }), `bulletins-paie-cycle-${selectedPayRunId}.pdf`);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to download pay run payslips PDF'));
    }
  };

  const stats = useMemo(() => {
    const total = payslips.reduce((sum, p) => sum + Number(p.netSalary || 0), 0);
    const pending = payslips.filter((p) => p.paymentStatus === 'PENDING').length;
    const partial = payslips.filter((p) => p.paymentStatus === 'PARTIAL').length;
    const paid = payslips.filter((p) => p.paymentStatus === 'PAID').length;
    return { total, count: payslips.length, pending, partial, paid };
  }, [payslips]);

  if (!canAccess) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Accès refusé. Cette page est réservée aux administrateurs.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and export payslips; edit deductions only in DRAFT cycles</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={downloadPayRunPDF} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export Pay Run (PDF)
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee, id, or period"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedPayRunId}
            onChange={(e) => setSelectedPayRunId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Pay Run</option>
            {payRuns.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name || `PayRun #${pr.id}`} — {safeDate(pr.startDate)} to {safeDate(pr.endDate)} ({pr.status})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={employeeIdFilter}
            onChange={(e) => setEmployeeIdFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-48"
            placeholder="Filter by Employee ID"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={loadPayslips} className="p-2 hover:bg-gray-100 rounded-lg" title="Apply filters">
            <Filter className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payslips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Net Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.total)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">P</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Partial / Paid</p>
              <p className="text-2xl font-bold text-gray-900">{stats.partial} / {stats.paid}</p>
            </div>
            <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">PP</span>
          </div>
        </div>
      </div>

      {/* Payslips List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">All Payslips</h3>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading payslips...</div>
        ) : filteredPayslips.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No payslips found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayslips.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                    {(p.employee?.fullName || 'E').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.employee?.fullName || 'Employee'}</p>
                    <p className="text-sm text-gray-600">Payslip ID: {p.id} — Employee ID: {p.employeeId}</p>
                    <p className="text-xs text-gray-500">{safeDate(p.payRun?.startDate)} - {safeDate(p.payRun?.endDate)} ({p.payRun?.status || '-'})</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">{formatMoney(p.netSalary)}</p>
                    <p className="text-xs text-gray-500">Gross: {formatMoney(p.grossSalary)} — Deductions: {formatMoney(p.totalDeductions)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusBadgeColor(p.paymentStatus)}`}>
                    {p.paymentStatus || 'PENDING'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDetails(p.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadPayslipPDF(p.id)}
                      className={`p-2 text-gray-600 hover:bg-gray-100 rounded ${rowLoading[p.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!!rowLoading[p.id]}
                      title="Download PDF"
                    >
                      {rowLoading[p.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Payslip Details</h3>
              <button onClick={() => setShowDetails(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {detailsLoading || !selectedPayslip ? (
              <div className="py-10 text-center text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading details...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Employee" value={selectedPayslip.employee?.fullName} />
                    <InfoRow label="Status" value={<span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusBadgeColor(selectedPayslip.paymentStatus)}`}>{selectedPayslip.paymentStatus}</span>} />
                    <InfoRow label="Period" value={`${safeDate(selectedPayslip.payRun?.startDate)} - ${safeDate(selectedPayslip.payRun?.endDate)} (${selectedPayslip.payRun?.status || '-'})`} />
                    <InfoRow label="Gross Salary" value={formatMoney(selectedPayslip.grossSalary)} />
                    <InfoRow label="Total Deductions" value={formatMoney(selectedPayslip.totalDeductions)} />
                    <InfoRow label="Net Salary" value={<span className="font-bold text-green-600">{formatMoney(selectedPayslip.netSalary)}</span>} />
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" /> Deductions ({selectedPayslip.deductions?.length || 0})
                  </h4>
                  {(!selectedPayslip.deductions || selectedPayslip.deductions.length === 0) ? (
                    <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No deductions.</div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPayslip.deductions.map((d, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{d.label}</td>
                              <td className="px-4 py-3 text-sm text-right text-red-600">-{formatMoney(d.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Payments */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center text-lg">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" /> Payments ({selectedPayslip.payments?.length || 0})
                  </h4>
                  {(!selectedPayslip.payments || selectedPayslip.payments.length === 0) ? (
                    <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No payments recorded.</div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPayslip.payments.map((pm) => (
                            <tr key={pm.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{formatMoney(pm.amount)}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{pm.paymentMethod}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{pm.reference || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{pm.paidAt ? new Date(pm.paidAt).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedPayslip.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 font-medium mb-1">Notes</div>
                    <div className="text-gray-800">{selectedPayslip.notes}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {canEdit && (
                    <button onClick={startEdit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center">
                      <Edit className="h-4 w-4 mr-2" /> Edit Deductions
                    </button>
                  )}
                  <button onClick={() => downloadPayslipPDF(selectedPayslip.id)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center">
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Payslip Deductions</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Gross: {formatMoney(selectedPayslip?.grossSalary)} • Current Net: {formatMoney(selectedPayslip?.netSalary)}</div>
                  <button type="button" onClick={addDeductionRow} className="px-3 py-1 text-sm bg-blue-600 text-white rounded flex items-center">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </button>
                </div>
                {editForm.deductions.length === 0 && (
                  <div className="text-gray-500 text-center py-6 bg-gray-50 rounded">No deductions. Add one.</div>
                )}
                {editForm.deductions.map((d, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label"
                      value={d.label}
                      onChange={(e) => updateDeduction(idx, 'label', e.target.value)}
                      className="col-span-7 px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={d.amount}
                      onChange={(e) => updateDeduction(idx, 'amount', e.target.value)}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded"
                    />
                    <button type="button" onClick={() => removeDeductionRow(idx)} className="col-span-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded flex items-center justify-center">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {editErrors.deductions && <div className="text-red-600 text-sm">{editErrors.deductions}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Optional notes"
                />
              </div>
              {editErrors.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{editErrors.general}</div>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting || !canEdit} className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${editSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {editSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const statusBadgeColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-red-100 text-red-800';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAID':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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
  if (status === 400) return apiMsg || 'Invalid data';
  if (status === 401) return 'Session expired. Please login again.';
  if (status === 403) return 'Access denied. You do not have permission to perform this action.';
  if (status === 404) return 'Payslip not found';
  if (status === 409) return apiMsg || 'Cannot modify payslip of an approved cycle';
  return apiMsg || fallback;
};

const formatMoney = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
};

const safeDate = (d) => {
  try {
    return d ? new Date(d).toLocaleDateString() : '-';
  } catch {
    return '-';
  }
};

export default Payslips;
