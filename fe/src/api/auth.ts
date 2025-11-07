import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: number;
    email: string;
    username: string;
    fullName: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    totalBalance: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Đăng nhập user
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    data
  );
  return response.data.data;
};

export interface RegisterRequest {
  email: string;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    userId: number;
    email: string;
    username: string;
    fullName: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    totalBalance: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Đăng ký user mới
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(
    '/auth/register',
    data
  );
  return response.data.data;
};

/**
 * Đăng xuất user
 * Xóa accessToken và user khỏi localStorage
 */
export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

