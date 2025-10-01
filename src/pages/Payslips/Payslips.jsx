import React, { useState, useEffect } from 'react';
import {
  Download,
  Plus,
  Eye,
  Search,
  Filter,
  FileText,
  Calendar,
  DollarSign,
  User,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Payslips = () => {
  const { currentUser } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      // Mock data since there's no dedicated payslips endpoint yet
      // In production, this would fetch from payruns and extract payslips
      setPayslips([
        { 
          id: 1, 
          employeeName: 'Ethan Carter', 
          employeeId: '12345', 
          grossSalary: 5500, 
          deductions: 825,
          netSalary: 4675,
          period: 'March 2024',
          status: 'Paid',
          payDate: '2024-03-31'
        },
        { 
          id: 2, 
          employeeName: 'Olivia Bennett', 
          employeeId: '67890', 
          grossSalary: 6200,
          deductions: 930,
          netSalary: 5270,
          period: 'March 2024',
          status: 'Paid',
          payDate: '2024-03-31'
        },
        { 
          id: 3, 
          employeeName: 'Noah Thompson', 
          employeeId: '24680', 
          grossSalary: 4800,
          deductions: 720,
          netSalary: 4080,
          period: 'March 2024',
          status: 'Pending',
          payDate: '2024-03-31'
        },
        { 
          id: 4, 
          employeeName: 'Ava Harper', 
          employeeId: '13579', 
          grossSalary: 5900,
          deductions: 885,
          netSalary: 5015,
          period: 'March 2024',
          status: 'Paid',
          payDate: '2024-03-31'
        },
        { 
          id: 5, 
          employeeName: 'Liam Foster', 
          employeeId: '97531', 
          grossSalary: 5100,
          deductions: 765,
          netSalary: 4335,
          period: 'March 2024',
          status: 'Paid',
          payDate: '2024-03-31'
        },
        { 
          id: 6, 
          employeeName: 'Isabella Hayes', 
          employeeId: '86420', 
          grossSalary: 6500,
          deductions: 975,
          netSalary: 5525,
          period: 'March 2024',
          status: 'Pending',
          payDate: '2024-03-31'
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch payslips:', err);
      setError('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payslip) => {
    setSelectedPayslip(payslip);
    setShowDetailsModal(true);
  };

  const handleDownloadPayslip = (payslip) => {
    // In production, this would download the PDF
    console.log('Downloading payslip for:', payslip.employeeName);
  };

  const filteredPayslips = payslips.filter(payslip => {
    const matchesSearch = payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.employeeId.includes(searchTerm);
    const matchesFilter = !filterStatus || payslip.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPayslips: payslips.length,
    paidPayslips: payslips.filter(p => p.status === 'Paid').length,
    pendingPayslips: payslips.filter(p => p.status === 'Pending').length,
    totalAmount: payslips.reduce((sum, p) => sum + p.netSalary, 0),
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
        <div className="flex space-x-2">
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </button>
          {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Generate Payslips
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payslips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPayslips}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paidPayslips}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayslips}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
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
            {filteredPayslips.map((payslip) => (
              <div key={payslip.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                    {payslip.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payslip.employeeName}</p>
                    <p className="text-sm text-gray-600">Employee ID: {payslip.employeeId}</p>
                    <p className="text-xs text-gray-500">{payslip.period}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">${payslip.netSalary.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Gross: ${payslip.grossSalary.toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    payslip.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payslip.status}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(payslip)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPayslip(payslip)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payslip Details Modal */}
      {showDetailsModal && selectedPayslip && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Payslip Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedPayslip.employeeName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedPayslip.employeeName}</h4>
                  <p className="text-sm text-gray-600">Employee ID: {selectedPayslip.employeeId}</p>
                  <p className="text-sm text-gray-600">Period: {selectedPayslip.period}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Gross Salary</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${selectedPayslip.grossSalary.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Deductions</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">-${selectedPayslip.deductions.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-lg font-medium text-gray-700">Net Salary</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">${selectedPayslip.netSalary.toLocaleString()}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Payment Date</span>
                  </div>
                  <p className="font-medium text-gray-900">{new Date(selectedPayslip.payDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                    selectedPayslip.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPayslip.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => handleDownloadPayslip(selectedPayslip)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payslips;