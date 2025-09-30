import axios from 'axios';

const API_BASE_URL = 'https://gestion-salaire.onrender.com';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token and impersonation companyId
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const impId = localStorage.getItem('impersonateCompanyId');
    if (impId) {
      const companyId = Number(impId);
      // Inject companyId as query param for GET employees/payruns
      if (config.method === 'get') {
        if (config.url?.startsWith('/employees') || config.url?.startsWith('/payruns')) {
          config.params = { ...(config.params || {}), companyId };
        }
      }
      // Inject companyId into POST body for creating employees/payruns if absent
      if (config.method === 'post') {
        if (config.url === '/employees' || config.url === '/payruns') {
          if (typeof config.data === 'string') {
            try {
              const parsed = JSON.parse(config.data);
              config.data = JSON.stringify({ companyId, ...parsed });
            } catch (_) {
              // ignore parsing error
            }
          } else if (typeof config.data === 'object' && config.data !== null) {
            config.data = { companyId, ...config.data };
          }
        }
      }
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

export const createCompany = (data) => api.post('/company/create', data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
 
export const getUsers = () => api.get('/auth/users');

export const createAdmin = (data) => api.post('/auth/create-user', data);

export const getAdminById = (id) => api.get(`/admin/${id}`);

export const updateAdmin = (id, data) => api.put(`/admin/${id}`, data);

export const deleteAdmin = (id) => api.delete(`/admin/${id}`);

export const getEmployees = (params = {}) => api.get('/employees', { params });
export const getEmployeeById = (id) => api.get(`/employees/${id}`);

export const createEmployee = (data) => api.post('/employees', data);

export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);

export const activateEmployee = (id) => api.patch(`/employees/${id}/activate`);

export const deactivateEmployee = (id) => api.patch(`/employees/${id}/deactivate`);

export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Pay Runs API
export const getPayRuns = (params = {}) => api.get('/payruns', { params });
export const getPayRunById = (id) => api.get(`/payruns/${id}`);
export const createPayRun = (data) => api.post('/payruns', data);
export const updatePayRun = (id, data) => api.put(`/payruns/${id}`, data);
export const approvePayRun = (id) => api.patch(`/payruns/${id}/approve`);
export const closePayRun = (id) => api.patch(`/payruns/${id}/close`);
export const deletePayRun = (id) => api.delete(`/payruns/${id}`);

export default api;
