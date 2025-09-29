import axios from 'axios';

const API_BASE_URL = 'https://gestion-salaire.onrender.com';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getCompanies = () => api.get('/company');

export const getCompanyById = (id) => api.get(`/company/${id}`);

export const deleteCompany = (id) => api.delete(`/company/${id}`);

export const createCompany = (data) => api.post('/company', data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
 
export const getUsers = () => api.get('/auth/users');

export const createAdmin = (data) => api.post('/auth/create-user', data);

export const getAdminById = (id) => api.get(`/admin/${id}`);

export const updateAdmin = (id, data) => api.put(`/admin/${id}`, data);

export const deleteAdmin = (id) => api.delete(`/admin/${id}`);

export default api;
