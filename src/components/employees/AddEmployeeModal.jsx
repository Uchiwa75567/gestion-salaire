import React from 'react';
import { X } from 'lucide-react';

const AddEmployeeModal = ({
  showAddModal,
  setShowAddModal,
  formData,
  handleInputChange,
  handleAddEmployee,
  submitting,
  fieldErrors,
  error,
}) => {
  if (!showAddModal) return null;

  return (
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
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
};

export default AddEmployeeModal;
