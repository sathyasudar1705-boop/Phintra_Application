import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handler, Automatic Logout on 401, & Offline Detection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pg_token');
      localStorage.removeItem('pg_auth');
      localStorage.removeItem('pg_role');
      localStorage.removeItem('pg_user');
      
      // Redirect to login page if unauthorized and not already on the login/register paths
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/forgot-password') {
        window.location.href = '/login';
      }
    } else if (!error.response) {
      // Backend is offline / unreachable (e.g. ERR_CONNECTION_REFUSED or Network Error)
      console.error("API connection error. The backend server appears to be offline or unreachable.", error);
      error.message = "The Phintra backend server is offline or unreachable. Please verify that the backend is running on port 8001.";
    }
    return Promise.reject(error);
  }
);

export default api;
