import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Request Interceptor: Attach token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Catch 401 Unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid / expired credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Dispatch global custom event to trigger AuthModal
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: { message: 'Vui lòng đăng nhập!' },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default API;
