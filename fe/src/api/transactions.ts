import { axiosInstance } from './axiosInstance';
import type { ApiResponse, PaginatedResponse } from './types';

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  categoryId: number;
  accountId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy danh sách giao dịch
 */
export const getTransactions = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Transaction>> => {
  const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Transaction>>>(
    `/transactions?page=${page}&limit=${limit}`
  );
  return response.data.data;
};

/**
 * Lấy thông tin một giao dịch
 */
export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await axiosInstance.get<ApiResponse<Transaction>>(
    `/transactions/${id}`
  );
  return response.data.data;
};

/**
 * Tạo giao dịch mới
 */
export const createTransaction = async (
  data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Transaction> => {
  const response = await axiosInstance.post<ApiResponse<Transaction>>(
    '/transactions',
    data
  );
  return response.data.data;
};

/**
 * Cập nhật giao dịch
 */
export const updateTransaction = async (
  id: number,
  data: Partial<Transaction>
): Promise<Transaction> => {
  const response = await axiosInstance.put<ApiResponse<Transaction>>(
    `/transactions/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Xóa giao dịch
 */
export const deleteTransaction = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/transactions/${id}`);
};
