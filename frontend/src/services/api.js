import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// console.log(import.meta.env.VITE_SOCKET_URL)


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let storeReference = null;

export const injectStore = (store) => {
  storeReference = store;
};

// Request interceptor to inject JWT access token
api.interceptors.request.use(
  (config) => {
    if (storeReference) {
      const token = storeReference.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Fallback to localStorage if store is not injected yet
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite refresh loops
    if (originalRequest?.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try calling the refresh-token endpoint
        // The HTTP-only cookie will be sent automatically since withCredentials is true
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        if (storeReference) {
          // Dispatch action to update token in Redux store
          storeReference.dispatch({
            type: 'auth/refreshTokenSuccess',
            payload: { token: accessToken },
          });
        } else {
          localStorage.setItem('accessToken', accessToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        if (storeReference) {
          storeReference.dispatch({ type: 'auth/logout/fulfilled' });
        } else {
          localStorage.removeItem('accessToken');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
