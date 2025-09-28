import React from 'react';
import { useAuth } from '../../context/AuthContext';

const RoleSwitcher = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated() || !currentUser) {
    return null;
  }

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    const updatedUser = { ...currentUser, role: newRole };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.location.reload();
  };

  return null;
};

export default RoleSwitcher;
