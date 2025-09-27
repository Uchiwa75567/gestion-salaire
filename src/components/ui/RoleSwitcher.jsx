import React from 'react';

const RoleSwitcher = ({ currentUser, setCurrentUser }) => (
  <div className="fixed top-4 right-4 z-50">
    <div className="bg-white rounded-lg shadow-lg p-4 border">
      <p className="text-sm font-medium text-gray-700 mb-2">Demo Mode - Switch Role:</p>
      <select
        value={currentUser.role}
        onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="SUPER_ADMIN">Super Admin</option>
        <option value="ADMIN">Admin</option>
        <option value="CASHIER">Cashier</option>
      </select>
    </div>
  </div>
);

export default RoleSwitcher;
