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
  
  // Lưu token và userId vào localStorage
  if (response.data.token) {
    const token = response.data.token.trim();
    localStorage.setItem('token', token);
    console.log('[Auth] Token saved from register:', token.substring(0, 20) + '...');
  }
  if (response.data.user?.id) {
    localStorage.setItem('userId', response.data.user.id.toString());
  }
  
  return response.data;
};

/**
 * API đăng nhập
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
  
  // Lưu token và userId vào localStorage
  if (response.data.accessToken) {
    const token = response.data.accessToken.trim();
    localStorage.setItem('token', token);
    console.log('[Auth] Token saved from login:', token.substring(0, 20) + '...');
    console.log('[Auth] Full token length:', token.length);
  } else {
    console.error('[Auth] No accessToken in login response:', response.data);
  }
  
  if (response.data.user?.id) {
    localStorage.setItem('userId', response.data.user.id.toString());
  }
  
  return response.data;
};

