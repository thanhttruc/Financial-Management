import axios from 'axios';
import { ENV } from '../config/env';

/**
 * Axios instance với cấu hình mặc định
 * Sử dụng cho tất cả các API calls trong ứng dụng
 */
export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Cho phép gửi credentials trong CORS request
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Thêm token nếu có (kiểm tra accessToken trong localStorage)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi toàn cục
    if (error.response?.status === 401) {
      // Unauthorized - xóa token và redirect về login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
