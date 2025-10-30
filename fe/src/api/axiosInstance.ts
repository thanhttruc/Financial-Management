import axios from 'axios';
import { ENV } from '../config/env';

/**
 * Axios instance với cấu hình mặc định
 * Sử dụng cho tất cả các API calls trong ứng dụng
 */
export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Thêm token nếu có
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi toàn cục
    if (error.response?.status === 401) {
      // Chỉ xóa token nếu KHÔNG phải lỗi từ endpoint /auth/login hoặc /auth/register
      // Vì khi đăng nhập/đăng ký sai, 401 là bình thường và không cần xóa token
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        // Token đã hết hạn hoặc không hợp lệ cho các API khác
        localStorage.removeItem('token');
        // Không redirect tự động ở đây, để component tự xử lý
      }
    }
    return Promise.reject(error);
  }
);
