import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  Plus,
  Eye,
  Download,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getPaymentsByPayslip,
  getPaymentsByCompany,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  downloadPaymentReceipt,
  downloadCompanyPaymentsList,
  getCompanies,
  getPayRuns,
  getPayslipsByCompany,
} from '../services/api';

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'ORANGE_MONEY', 'WAVE', 'OTHER'];

const Payments = () => {
  const { currentUser, impersonateCompanyId } = useAuth();

  // List state
  const [filters, setFilters] = useState({
    companyId: '',
    payRunId: '',
    paymentMethod: '',
  });
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
  const [payRuns, setPayRuns] = useState([]);
  const [payslips, setPayslips] = useState([]);

  // Create/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    payslipId: '',
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    reference: '',
    notes: '',
    paidAt: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Details modal state
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Row loading
  const [rowLoading, setRowLoading] = useState({});

  const canAccess = ['SUPERADMIN', 'ADMIN', 'CAISSIER'].includes(currentUser?.role);
  const canModify = ['SUPERADMIN', 'ADMIN', 'CAISSIER'].includes(currentUser?.role);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    loadInitialData();
  }, [canAccess]);

  useEffect(() => {
    if (!canAccess) return;
    loadPayments();
  }, [filters, impersonateCompanyId]);

  const loadInitialData = async () => {
    try {
      // Determine company ID for payslips
      let companyId = null;
      if (currentUser.role === 'SUPERADMIN') {
        companyId = impersonateCompanyId || currentUser.companyId;
      } else if (currentUser.role === 'ADMIN') {
        companyId = currentUser.companyId;
      } else if (currentUser.role === 'CAISSIER') {
        companyId = currentUser.companyId;
      }

      const promises = [getCompanies(), getPayRuns()];
      if (companyId) {
        promises.push(getPayslipsByCompany(companyId));
      }

      const [companiesRes, payRunsRes, payslipsRes] = await Promise.all(promises);
      setCompanies(companiesRes.data || []);
      setPayRuns(payRunsRes.data || []);
      if (payslipsRes) {
        setPayslips(payslipsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');

      let params = {};
      if (filters.payRunId) params.payRunId = filters.payRunId;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

      // Determine company ID
      let companyId = null;
      if (currentUser.role === 'SUPERADMIN') {
        companyId = impersonateCompanyId || filters.companyId;
      } else if (currentUser.role === 'ADMIN') {
        companyId = currentUser.companyId;
      } else if (currentUser.role === 'CAISSIER') {
        companyId = currentUser.companyId;
      }

      if (!companyId) {
        setList([]);
        setLoading(false);
        return;
      }

      const res = await getPaymentsByCompany(companyId, params);
      setList(res.data || []);
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to load payments');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        (p.payslip?.employee?.fullName || '').toLowerCase().includes(q) ||
        (p.reference || '').toLowerCase().includes(q) ||
        (p.paymentMethod || '').toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        formatMoney(p.amount).toLowerCase().includes(q)
    );
  }, [list, search]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      payslipId: '',
      amount: '',
      paymentMethod: 'BANK_TRANSFER',
      reference: '',
      notes: '',
      paidAt: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (payment) => {
    setModalMode('edit');
    setFormData({
      payslipId: payment.payslipId,
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      reference: payment.reference || '',
      notes: payment.notes || '',
      paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString().split('T')[0] : '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.payslipId) errors.payslipId = 'Payslip is required';
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (!formData.paidAt) errors.paidAt = 'Payment date is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      const payload = {
        payslipId: parseInt(formData.payslipId),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
        paidAt: formData.paidAt,
      };

      if (modalMode === 'create') {
        await createPayment(payload);
      } else {
        await updatePayment(selectedPayment.id, payload);
      }

      setShowModal(false);
      await loadPayments();
      setError('');
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to save payment');
      if (err?.response?.status === 400) {
        setFormErrors({ general: msg });
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openDetails = async (id) => {
    setShowDetails(true);
    setSelectedPayment(null);
    try {
      setDetailsLoading(true);
      const res = await getPaymentById(id);
      setSelectedPayment(res.data);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to load payment details'));
      setShowDetails(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) return;

    setRowLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await deletePayment(id);
      await loadPayments();
      setError('');
    } catch (err) {
      setError(mapHttpError(err, 'Failed to delete payment'));
    } finally {
      setRowLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const downloadReceipt = async (id) => {
    setRowLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await downloadPaymentReceipt(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-receipt-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to download receipt'));
    } finally {
      setRowLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const downloadPaymentsList = async () => {
    if (!currentUser.companyId && !impersonateCompanyId && !filters.companyId) {
      setError('Please select a company');
      return;
    }

    const companyId = impersonateCompanyId || filters.companyId || currentUser.companyId;
    try {
      const res = await downloadCompanyPaymentsList(companyId, filters.payRunId ? { payRunId: filters.payRunId } : {});
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-list-company-${companyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to download payments list'));
    }
  };

  const stats = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const byMethod = filteredPayments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount || 0);
      return acc;
    }, {});
    return { total, count: filteredPayments.length, byMethod };
  }, [filteredPayments]);

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'BANK_TRANSFER':
        return 'bg-blue-100 text-blue-800';
      case 'ORANGE_MONEY':
        return 'bg-orange-100 text-orange-800';
      case 'WAVE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!canAccess) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Accès refusé. Cette page est réservée aux administrateurs et caissiers.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-600 mt-1">Manage employee payments and payment methods</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadPaymentsList}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" /> Export List (PDF)
          </button>
          {canModify && (
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </button>
          )}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.total)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bank Transfers</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.byMethod.BANK_TRANSFER || 0)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cash Payments</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.byMethod.CASH || 0)}</p>
            </div>
            <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee, reference, method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {currentUser.role === 'SUPERADMIN' && !impersonateCompanyId && (
            <select
              value={filters.companyId}
              onChange={(e) => setFilters((prev) => ({ ...prev, companyId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.address}
                </option>
              ))}
            </select>
          )}
          <select
            value={filters.payRunId}
            onChange={(e) => setFilters((prev) => ({ ...prev, payRunId: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Pay Runs</option>
            {payRuns.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name || `PayRun #${pr.id}`} ({pr.status})
              </option>
            ))}
          </select>
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">All Payments</h3>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-sm mt-1">Create your first payment to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                    {(p.payslip?.employee?.fullName || 'E')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {p.payslip?.employee?.fullName || 'Employee'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment ID: {p.id} • Reference: {p.reference || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.payslip?.payRun?.name || `PayRun #${p.payslip?.payRunId}`} •{' '}
                      {new Date(p.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">
                      {formatMoney(p.amount)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                        p.paymentMethod
                      )}`}
                    >
                      {p.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDetails(p.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadReceipt(p.id)}
                      className={`p-2 text-gray-600 hover:bg-gray-100 rounded ${rowLoading[p.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!!rowLoading[p.id]}
                      title="Download Receipt"
                    >
                      {rowLoading[p.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </button>
                    {canModify && (
                      <>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="Edit Payment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className={`p-2 text-red-600 hover:bg-red-100 rounded ${rowLoading[p.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!!rowLoading[p.id]}
                          title="Delete Payment"
                        >
                          {rowLoading[p.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{modalMode === 'create' ? 'Create Payment' : 'Edit Payment'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payslip *</label>
                <select
                  name="payslipId"
                  value={formData.payslipId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.payslipId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select a payslip</option>
                  {payslips.map((payslip) => (
                    <option key={payslip.id} value={payslip.id}>
                      {payslip.employee?.fullName || 'Employee'} - {formatMoney(payslip.netSalary || 0)} ({payslip.payRun?.name || `PayRun #${payslip.payRunId}`})
                    </option>
                  ))}
                </select>
                {formErrors.payslipId && <p className="text-red-500 text-sm mt-1">{formErrors.payslipId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace('_', ' ')}</option>
                  ))}
                </select>
                {formErrors.paymentMethod && <p className="text-red-500 text-sm mt-1">{formErrors.paymentMethod}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="REC-2025-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  name="paidAt"
                  value={formData.paidAt}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.paidAt ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.paidAt && <p className="text-red-500 text-sm mt-1">{formErrors.paidAt}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>
              {formErrors.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{formErrors.general}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !canModify}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    modalMode === 'create' ? 'Create Payment' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <button onClick={() => setShowDetails(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {detailsLoading ? (
              <div className="py-8 text-center text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading payment details...
              </div>
            ) : selectedPayment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-medium">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">{formatMoney(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedPayment.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reference</p>
                    <p className="font-medium">{selectedPayment.reference || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid At</p>
                    <p className="font-medium">{new Date(selectedPayment.paidAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="font-medium">{selectedPayment.createdByUser?.name || 'System'}</p>
                  </div>
                </div>
                {selectedPayment.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium">{selectedPayment.notes}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    onClick={() => downloadReceipt(selectedPayment.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </button>
                  {canModify && (
                    <button
                      onClick={() => {
                        setShowDetails(false);
                        openEditModal(selectedPayment);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Payment
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">Payment not found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const mapHttpError = (err, fallback) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.error || err?.response?.data?.message;
  if (status === 400) return apiMsg || 'Invalid data';
  if (status === 401) return 'Session expired. Please login again.';
  if (status === 403) return 'Access denied. You do not have permission to perform this action.';
  if (status === 404) return 'Resource not found';
  return apiMsg || fallback;
};

const formatMoney = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
};

export default Payments;
