import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
});

// Request Interceptor: Attach token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Catch 401 Unauthorized globally (exclude auth endpoints)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

      // Only dispatch global logout if an authenticated request failed due to expired token
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Dispatch global custom event to trigger AuthModal
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default API;
