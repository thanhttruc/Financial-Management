import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export type TransactionType = 'Revenue' | 'Expense';
export type TransactionFilterType = 'All' | 'Revenue' | 'Expense';

export interface Transaction {
  transactionId: number;
  accountId: number;
  transactionDate: string;
  type: TransactionType;
  itemDescription: string;
  shopName: string;
  amount: number;
  paymentMethod: string;
  status: 'Complete' | 'Pending' | 'Failed';
  receiptId: string | null;
  createdAt: string;
}

export interface GetTransactionsResponse {
  data: Transaction[];
  total: number;
  hasMore: boolean;
}

export interface CreateTransactionRequest {
  accountId: number;
  transactionDate: string; // ISO string
  type: TransactionType;
  itemDescription: string;
  shopName?: string;
  amount: number;
  paymentMethod?: string;
  status?: 'Complete' | 'Pending' | 'Failed';
  // Expense Detail fields (chỉ bắt buộc khi type = Expense)
  categoryId?: number;
  subCategoryName?: string;
  subCategoryAmount?: number;
}

/**
 * Lấy danh sách giao dịch
 */
export const getTransactions = async (
  type: TransactionFilterType = 'All',
  limit: number = 10,
  offset: number = 0,
  userId?: number,
): Promise<GetTransactionsResponse> => {
  const params = new URLSearchParams();
  if (type !== 'All') {
    params.append('type', type);
  }
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  if (userId) {
    params.append('userId', userId.toString());
  }

  const response = await axiosInstance.get<GetTransactionsResponse>(
    `/v1/transactions?${params.toString()}`
  );
  return response.data;
};

/**
 * Lấy thông tin một giao dịch
 */
export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await axiosInstance.get<ApiResponse<Transaction>>(
    `/v1/transactions/${id}`
  );
  return response.data.data;
};

/**
 * Tạo giao dịch mới
 */
export const createTransaction = async (
  data: CreateTransactionRequest
): Promise<ApiResponse<Transaction>> => {
  const response = await axiosInstance.post<ApiResponse<Transaction>>(
    '/v1/transactions',
    data
  );
  return response.data;
};

/**
 * Cập nhật giao dịch
 */
export const updateTransaction = async (
  id: number,
  data: Partial<Transaction>
): Promise<Transaction> => {
  const response = await axiosInstance.put<ApiResponse<Transaction>>(
    `/v1/transactions/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Xóa giao dịch
 */
export const deleteTransaction = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/v1/transactions/${id}`);
};
