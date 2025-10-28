import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export interface Account {
  id: number;
  name: string;
  type: 'bank' | 'cash' | 'credit_card' | 'savings';
  balance: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy danh sách tài khoản
 */
export const getAccounts = async (): Promise<Account[]> => {
  const response = await axiosInstance.get<ApiResponse<Account[]>>('/accounts');
  return response.data.data;
};

/**
 * Tạo tài khoản mới
 */
export const createAccount = async (
  data: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'balance'>
): Promise<Account> => {
  const response = await axiosInstance.post<ApiResponse<Account>>(
    '/accounts',
    data
  );
  return response.data.data;
};

/**
 * Cập nhật tài khoản
 */
export const updateAccount = async (
  id: number,
  data: Partial<Account>
): Promise<Account> => {
  const response = await axiosInstance.put<ApiResponse<Account>>(
    `/accounts/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Xóa tài khoản
 */
export const deleteAccount = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/accounts/${id}`);
};
