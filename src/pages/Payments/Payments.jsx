import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  X,
  Loader2,
  DollarSign,
  Calendar,
  FileText,
  Trash2,
  Edit,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; // Added import for api

import {
  getCompanies,
  getPaymentsByCompany,
  getPaymentsByPayslip,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  downloadPaymentReceipt,
  downloadCompanyPaymentsList,
  downloadPayrollRegister,
  getPayslipsByCompany,
} from '../../services/api';

const METHODS = ['CASH', 'BANK_TRANSFER', 'ORANGE_MONEY', 'WAVE', 'OTHER'];

const Payments = () => {
  const { currentUser, impersonateCompanyId } = useAuth();

  // Filters
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Payslips for dropdown
  const [payslips, setPayslips] = useState([]);

  // Employees extracted from payslips
  const [employees, setEmployees] = useState([]);

  // Unpaid payslips for selected employee
  const [unpaidPayslips, setUnpaidPayslips] = useState([]);

  // Data
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Row state
  const [rowLoading, setRowLoading] = useState({});

  // Record Payment Modal
  const [showRecord, setShowRecord] = useState(false);
  const [recordSubmitting, setRecordSubmitting] = useState(false);
  const [recordForm, setRecordForm] = useState({
    payslipId: '',
    amount: '',
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
  });
  const [recordErrors, setRecordErrors] = useState({});
  const [employeePayslips, setEmployeePayslips] = useState([]);

  // Edit Payment Modal
  const [showEdit, setShowEdit] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, amount: '', paymentMethod: 'CASH', reference: '', notes: '' });
  const [editErrors, setEditErrors] = useState({});

  // History Modal
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyPayslipId, setHistoryPayslipId] = useState(null);

  const effectiveCompanyId = useMemo(() => {
    if (currentUser?.role === 'SUPERADMIN') {
      return impersonateCompanyId || (selectedCompanyId ? Number(selectedCompanyId) : undefined);
    }
    return currentUser?.companyId;
  }, [currentUser, impersonateCompanyId, selectedCompanyId]);

  useEffect(() => {
    if (currentUser?.role === 'SUPERADMIN') {
      loadCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  useEffect(() => {
    if (!effectiveCompanyId) {
      setPayslips([]);
      setEmployees([]);
      return;
    }
    const loadPayslips = async () => {
      try {
        const res = await getPayslipsByCompany(effectiveCompanyId);
        setPayslips(res.data || []);
      } catch (err) {
        console.error('Failed to load payslips', err);
        setPayslips([]);
      }
    };
    const loadEmployees = async () => {
      if (currentUser?.role === 'CAISSIER') {
        // For cashier, load employees directly from API
        try {
          const res = await api.get('/employees');
          setEmployees(res.data || []);
        } catch (err) {
          console.error('Failed to load employees', err);
          setEmployees([]);
        }
      } else {
        // Extract unique employees from payslips
        const uniqueEmployees = [...new Map(payslips.map(p => [p.employee.id, p.employee])).values()];
        setEmployees(uniqueEmployees);
      }
    };
    loadPayslips().then(loadEmployees);
  }, [effectiveCompanyId, currentUser?.role]);


  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCompanyId, startDate, endDate]);

  // Load unpaid payslips when employee is selected
  // Removed because payment is now for all active employees of the company
  useEffect(() => {
    if (!effectiveCompanyId) {
      setUnpaidPayslips([]);
      return;
    }
    const loadUnpaidPayslips = async () => {
      try {
        const res = await getPayslipsByCompany(effectiveCompanyId);
        const allPayslips = res.data || [];
        // Filter only unpaid or partial payslips (payRun level) for active employees
        // Group payslips by payRunId to get unique payRuns
        const payRunMap = new Map();
        allPayslips.forEach(p => {
          if (p.paymentStatus !== 'PAID' && p.employee?.isActive) {
            if (!payRunMap.has(p.payRunId)) {
              payRunMap.set(p.payRunId, {
                payRunId: p.payRunId,
                payRunName: p.payRun?.name || `Cycle ${p.payRunId}`,
                period: p.payRun?.period || '',
                payslips: []
              });
            }
            payRunMap.get(p.payRunId).payslips.push(p);
          }
        });
        // Convert map to array of payRuns with payslips
        const payRuns = Array.from(payRunMap.values());
        setUnpaidPayslips(payRuns);
      } catch (err) {
        console.error('Failed to load unpaid payslips grouped by payRun', err);
        setUnpaidPayslips([]);
      }
    };
    loadUnpaidPayslips();
  }, [effectiveCompanyId]);

  // Load unpaid payslips for record modal dropdown
  useEffect(() => {
    if (employeePayslips.length === 0) {
      setUnpaidPayslips([]);
      return;
    }
    const loadUnpaidPayslips = async () => {
      try {
        const payslipsWithPaymentInfo = await Promise.all(
          employeePayslips.map(async (payslip) => {
            try {
              const paymentsRes = await getPaymentsByPayslip(payslip.id);
              const totalPaid = paymentsRes.data.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
              return {
                ...payslip,
                totalPaid,
                remainingAmount: payslip.netSalary - totalPaid
              };
            } catch (err) {
              console.error(`Failed to load payments for payslip ${payslip.id}`, err);
              return {
                ...payslip,
                totalPaid: 0,
                remainingAmount: payslip.netSalary
              };
            }
          })
        );

        const unpaid = payslipsWithPaymentInfo.filter(p =>
          p.remainingAmount > 0.01 || p.paymentStatus === 'PARTIAL'
        );

        setUnpaidPayslips(unpaid);
      } catch (err) {
        console.error('Failed to load unpaid payslips', err);
        setUnpaidPayslips([]);
      }
    };
    loadUnpaidPayslips();
  }, [employeePayslips]);

  const loadCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Failed to load companies', err);
    }
  };

  const loadPayments = async () => {
    if (!effectiveCompanyId) {
      setPayments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await getPaymentsByCompany(effectiveCompanyId, params);
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to load payments'));
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.toLowerCase();
    return payments.filter((p) => {
      const emp = p.payslip?.employee?.fullName || '';
      const ref = p.reference || '';
      const method = p.paymentMethod || '';
      return (
        emp.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        String(p.payslipId || '').includes(q) ||
        ref.toLowerCase().includes(q) ||
        method.toLowerCase().includes(q)
      );
    });
  }, [payments, search]);

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return {
      totalAmount: total,
      count: payments.length,
    };
  }, [payments]);

  // Record Payment
  const openRecord = () => {
    setRecordErrors({});
    setRecordForm({ payslipId: '', amount: '', paymentMethod: 'CASH', reference: '', notes: '' });
    setShowRecord(true);
  };

  const submitRecord = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!recordForm.payslipId) errs.payslipId = 'Bulletin requis';
    if (!recordForm.amount || Number(recordForm.amount) <= 0) errs.amount = 'Montant valide requis';
    if (!recordForm.paymentMethod) errs.paymentMethod = 'Méthode de paiement requise';
    setRecordErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      setRecordSubmitting(true);
      await createPayment({
        payslipId: Number(recordForm.payslipId),
        amount: Number(recordForm.amount),
        paymentMethod: recordForm.paymentMethod,
        reference: recordForm.reference || undefined,
        notes: recordForm.notes || undefined,
      });
      setShowRecord(false);
      await loadPayments();
    } catch (err) {
      const msg = mapHttpError(err, 'Échec de l\'enregistrement du paiement');
      if (err?.response?.status === 400) setRecordErrors((e) => ({ ...e, general: msg }));
      else setError(msg);
    } finally {
      setRecordSubmitting(false);
    }
  };

  // History
  const openHistory = async (payslipId) => {
    setShowHistory(true);
    setHistory([]);
    setHistoryPayslipId(payslipId);
    try {
      setHistoryLoading(true);
      const res = await getPaymentsByPayslip(payslipId);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to load payments history'));
      setShowHistory(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Edit Payment
  const openEdit = async (paymentId) => {
    try {
      const res = await getPaymentById(paymentId);
      const p = res.data;
      setEditForm({ id: p.id, amount: p.amount, paymentMethod: p.paymentMethod, reference: p.reference || '', notes: p.notes || '' });
      setEditErrors({});
      setShowEdit(true);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to load payment'));
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.amount || Number(editForm.amount) <= 0) errs.amount = 'Valid amount is required';
    if (!editForm.paymentMethod) errs.paymentMethod = 'Payment method is required';
    setEditErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      setEditSubmitting(true);
      await updatePayment(editForm.id, {
        amount: Number(editForm.amount),
        paymentMethod: editForm.paymentMethod,
        reference: editForm.reference || undefined,
        notes: editForm.notes || undefined,
      });
      setShowEdit(false);
      await loadPayments();
      if (historyPayslipId) await openHistory(historyPayslipId);
    } catch (err) {
      const msg = mapHttpError(err, 'Failed to update payment');
      if (err?.response?.status === 400) setEditErrors((e) => ({ ...e, general: msg }));
      else setError(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  const doDelete = async (paymentId) => {
    if (!window.confirm('Delete this payment? This may affect related payslip status.')) return;
    setRowLoading((s) => ({ ...s, [paymentId]: true }));
    try {
      await deletePayment(paymentId);
      await loadPayments();
      if (historyPayslipId) await openHistory(historyPayslipId);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to delete payment'));
    } finally {
      setRowLoading((s) => ({ ...s, [paymentId]: false }));
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

  const downloadReceipt = async (paymentId) => {
    setRowLoading((s) => ({ ...s, [paymentId]: true }));
    try {
      const res = await downloadPaymentReceipt(paymentId);
      saveBlob(new Blob([res.data], { type: 'application/pdf' }), `recu-paiement-${paymentId}.pdf`);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to download receipt'));
    } finally {
      setRowLoading((s) => ({ ...s, [paymentId]: false }));
    }
  };

  const downloadList = async () => {
    if (!effectiveCompanyId) {
      setError('Select a company');
      return;
    }
    if (!startDate || !endDate) {
      setError('Select start and end date');
      return;
    }
    try {
      const res = await downloadCompanyPaymentsList(effectiveCompanyId, { startDate, endDate });
      saveBlob(new Blob([res.data], { type: 'application/pdf' }), `liste-paiements-${effectiveCompanyId}.pdf`);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to export payments list'));
    }
  };

  const [registerPayRunId, setRegisterPayRunId] = useState('');
  const downloadRegister = async () => {
    if (!effectiveCompanyId) {
      setError('Select a company');
      return;
    }
    if (!registerPayRunId) {
      setError('Enter Pay Run ID');
      return;
    }
    try {
      const res = await downloadPayrollRegister(effectiveCompanyId, Number(registerPayRunId));
      saveBlob(new Blob([res.data], { type: 'application/pdf' }), `registre-paie-${registerPayRunId}.pdf`);
    } catch (err) {
      setError(mapHttpError(err, 'Failed to export payroll register'));
    }
  };

  const canCreateOrModify = currentUser?.role === 'CAISSIER';
  const canExport = currentUser?.role === 'CAISSIER' || currentUser?.role === 'ADMIN';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-600 mt-1">Cashier payment management and exports</p>
        </div>
        <div className="flex space-x-2">
          {canExport && (
            <button onClick={downloadList} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export List (PDF)
            </button>
          )}
          {canCreateOrModify && (
            <button onClick={openRecord} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee, ref, method, id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {currentUser?.role === 'SUPERADMIN' && !impersonateCompanyId && (
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.name || c.address}>
                  {c.name || c.address}
                </option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <button onClick={loadPayments} className="p-2 hover:bg-gray-100 rounded-lg" title="Apply filters">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.totalAmount)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payments Count</p>
              <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Export Payroll Register</p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Pay Run ID"
                  value={registerPayRunId}
                  onChange={(e) => setRegisterPayRunId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 w-32"
                />
                <button onClick={downloadRegister} className="border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 flex items-center">
                  <Download className="h-4 w-4 mr-1" /> Register
                </button>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Payment Records</h3>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">#{p.id}</div>
                      <div className="text-xs text-gray-500">Payslip ID: {p.payslipId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(p.payslip?.employee?.fullName || 'E').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{p.payslip?.employee?.fullName || 'Employee'}</div>
                          {p.payslip?.employee?.id && (
                            <div className="text-sm text-gray-500">ID: {p.payslip.employee.id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatMoney(p.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{p.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.reference || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.paidAt ? new Date(p.paidAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openHistory(p.payslipId)} className="text-gray-600 hover:text-gray-900" title="View payslip payments">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadReceipt(p.id)}
                          className={`text-gray-600 hover:text-gray-900 ${rowLoading[p.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!!rowLoading[p.id]}
                          title="Download receipt"
                        >
                          {rowLoading[p.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </button>
                        {canCreateOrModify && (
                          <>
                            <button onClick={() => openEdit(p.id)} className="text-gray-600 hover:text-gray-900" title="Edit payment">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => doDelete(p.id)}
                              className={`text-red-600 hover:text-red-800 ${rowLoading[p.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={!!rowLoading[p.id]}
                              title="Delete payment"
                            >
                              {rowLoading[p.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showRecord && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Enregistrer un paiement</h3>
              <button onClick={() => setShowRecord(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bulletin de salaire *</label>
                <select
                  value={recordForm.payslipId}
                  onChange={(e) => {
                    const selectedPayRun = unpaidPayslips.find(pr => pr.payRunId === parseInt(e.target.value));
                    setRecordForm((f) => ({
                      ...f,
                      payslipId: e.target.value,
                      amount: selectedPayRun ? selectedPayRun.payslips.reduce((sum, p) => sum + (p.remainingAmount || 0), 0).toFixed(2) : ''
                    }));
                  }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${recordErrors.payslipId ? 'border-red-500' : ''}`}
                >
                  <option value="">Sélectionnez un cycle de paie</option>
                  {unpaidPayslips.map((pr) => (
                    <option key={pr.payRunId} value={pr.payRunId}>
                      {pr.payRunName} - {pr.period} - {pr.payslips.length} bulletins impayés
                    </option>
                  ))}
                </select>
                {recordErrors.payslipId && <p className="text-red-500 text-sm mt-1">{recordErrors.payslipId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    value={recordForm.amount}
                    onChange={(e) => setRecordForm((f) => ({ ...f, amount: e.target.value }))}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${recordErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Montant du paiement"
                  />
                </div>
                {recordForm.payslipId && (
                  <p className="text-xs text-gray-500 mt-1">Montant auto-rempli avec le restant, modifiable pour paiement partiel</p>
                )}
                {recordErrors.amount && <p className="text-red-500 text-sm mt-1">{recordErrors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement *</label>
                <select
                  value={recordForm.paymentMethod}
                  onChange={(e) => setRecordForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${recordErrors.paymentMethod ? 'border-red-500' : ''}`}
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace('_', ' ')}</option>
                  ))}
                </select>
                {recordErrors.paymentMethod && <p className="text-red-500 text-sm mt-1">{recordErrors.paymentMethod}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={recordForm.reference}
                  onChange={(e) => setRecordForm((f) => ({ ...f, reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="REC-2025-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>
              {recordErrors.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{recordErrors.general}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowRecord(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordSubmitting || !canCreateOrModify}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${recordSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {recordSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    'Enregistrer le paiement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEdit && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Payment</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${editErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
                {editErrors.amount && <p className="text-red-500 text-sm mt-1">{editErrors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${editErrors.paymentMethod ? 'border-red-500' : ''}`}
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace('_', ' ')}</option>
                  ))}
                </select>
                {editErrors.paymentMethod && <p className="text-red-500 text-sm mt-1">{editErrors.paymentMethod}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={editForm.reference}
                  onChange={(e) => setEditForm((f) => ({ ...f, reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="REC-2025-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>
              {editErrors.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{editErrors.general}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting || !canCreateOrModify}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${editSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payments History for Payslip #{historyPayslipId}</h3>
              <button onClick={() => setShowHistory(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {historyLoading ? (
              <div className="py-8 text-center text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No payments for this payslip.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {history.map((h) => (
                  <div key={h.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{formatMoney(h.amount)} • {h.paymentMethod}</div>
                      <div className="text-xs text-gray-500">Ref: {h.reference || '-'} • {h.paidAt ? new Date(h.paidAt).toLocaleString() : '-'}</div>
                      {h.createdByUser?.name && (
                        <div className="text-xs text-gray-500">By: {h.createdByUser.name}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => downloadReceipt(h.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Receipt">
                        <Download className="h-4 w-4" />
                      </button>
                      {canCreateOrModify && (
                        <>
                          <button onClick={() => openEdit(h.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => doDelete(h.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

const safeDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return '';
  }
};

export default Payments;
