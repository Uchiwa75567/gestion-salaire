import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impersonateCompanyId, setImpersonateCompanyId] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    console.log('Loaded user from localStorage:', user);
    setCurrentUser(user);
    const impId = localStorage.getItem('impersonateCompanyId');
    setImpersonateCompanyId(impId ? Number(impId) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const user = getCurrentUser();
        setCurrentUser(user);
      }
      if (e.key === 'impersonateCompanyId') {
        const impId = localStorage.getItem('impersonateCompanyId');
        setImpersonateCompanyId(impId ? Number(impId) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://gestion-salaire.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login response user:', data.user);

      const { token, user } = data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setCurrentUser(user);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('impersonateCompanyId');
    setImpersonateCompanyId(null);
    setCurrentUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const startImpersonation = (companyId) => {
    localStorage.setItem('impersonateCompanyId', String(companyId));
    setImpersonateCompanyId(Number(companyId));
  };

  const stopImpersonation = () => {
    localStorage.removeItem('impersonateCompanyId');
    setImpersonateCompanyId(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: () => isAuthenticated(),
    impersonateCompanyId,
    startImpersonation,
    stopImpersonation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
