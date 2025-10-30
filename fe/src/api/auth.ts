import { axiosInstance } from './axiosInstance';

/**
 * Interface cho request đăng ký
 */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Interface cho response đăng ký
 */
export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  token: string;
}

/**
 * Interface cho request đăng nhập
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface cho response đăng nhập
 */
export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
}

/**
 * API đăng ký tài khoản mới
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
  
  // Lưu token vào localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

/**
 * API đăng nhập
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
  
  // Lưu token vào localStorage
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }
  
  return response.data;
};

