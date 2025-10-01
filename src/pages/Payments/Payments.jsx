import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Users,
  Eye,
  X,
  Loader2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Payments = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchEmployees();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Mock data since there's no payments endpoint yet
      // In production, this would be: const response = await api.get('/payments');
      setPayments([
        {
          id: 1,
          employeeName: 'Sarah Wilson',
          amount: 3500,
          method: 'Bank Transfer',
          status: 'Completed',
          date: '2024-03-27',
          reference: 'PAY-2024-001'
        },
        {
          id: 2,
          employeeName: 'Michael Brown',
          amount: 2800,
          method: 'Wave',
          status: 'Pending',
          date: '2024-03-27',
          reference: 'PAY-2024-002'
        },
        {
          id: 3,
          employeeName: 'Emma Davis',
          amount: 4200,
          method: 'Orange Money',
          status: 'Completed',
          date: '2024-03-26',
          reference: 'PAY-2024-003'
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.employeeId) errors.employeeId = 'Employee is required';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Valid amount is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (!formData.date) errors.date = 'Date is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      // In production: await api.post('/payments', formData);
      setShowRecordModal(false);
      setFormData({
        employeeId: '',
        amount: '',
        paymentMethod: 'BANK_TRANSFER',
        reference: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchPayments();
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const filteredPayments = payments.filter(payment =>
    payment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalPaidToday: payments.filter(p => p.date === new Date().toISOString().split('T')[0] && p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'Pending').length,
    totalEmployees: employees.length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <div className="flex space-x-2">
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' || currentUser.role === 'CAISSIER') && (
            <button
              onClick={() => setShowRecordModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
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

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Paid Today</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalPaidToday.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Payment Records</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Filter className="h-4 w-4 text-gray-600" />
              </button>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {payment.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.reference}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-gray-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="h-4 w-4" />
                        </button>
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
      {showRecordModal && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Record Payment</h3>
              <button onClick={() => setShowRecordModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
                {fieldErrors.employeeId && <p className="text-red-500 text-sm mt-1">{fieldErrors.employeeId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.amount && <p className="text-red-500 text-sm mt-1">{fieldErrors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="WAVE">Wave</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="CASH">Cash</option>
                </select>
                {fieldErrors.paymentMethod && <p className="text-red-500 text-sm mt-1">{fieldErrors.paymentMethod}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="PAY-2024-XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {fieldErrors.date && <p className="text-red-500 text-sm mt-1">{fieldErrors.date}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                    submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    'Record Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;