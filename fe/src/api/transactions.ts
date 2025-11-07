import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export enum TransactionType {
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

export enum TransactionFilterType {
  ALL = 'All',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

export type Transaction = {
  transactionId: number;
  accountId: number;
  transactionDate: string;
  type: TransactionType;
  itemDescription: string;
  shopName: string | null;
  amount: number;
  paymentMethod: string | null;
  status: string;
  receiptId: string | null;
  createdAt: string;
};

export type GetTransactionsParams = {
  type?: TransactionFilterType;
  limit?: number;
  offset?: number;
};

export type GetTransactionsResponse = {
  data: Transaction[];
  total: number;
  hasMore: boolean;
};

export type CreateTransactionRequest = {
  accountId: number;
  type: TransactionType;
  itemDescription: string;
  amount: number;
  transactionDate: string;
  categoryId?: number;
  shopName?: string;
  paymentMethod?: string;
};

/**
 * Lấy danh sách giao dịch với phân trang và lọc
 * @param params Query parameters: type (All, Revenue, Expense), limit (mặc định 10), offset (mặc định 0)
 * @returns Object chứa data, total, hasMore
 */
export const getTransactions = async (
  params: GetTransactionsParams = {}
): Promise<GetTransactionsResponse> => {
  const { type = TransactionFilterType.ALL, limit = 10, offset = 0 } = params;

  const queryParams = new URLSearchParams();
  if (type !== TransactionFilterType.ALL) {
    queryParams.append('type', type);
  }
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());

  const response = await axiosInstance.get<ApiResponse<GetTransactionsResponse>>(
    `/api/v1/transactions?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Tạo giao dịch mới
 * @param data Dữ liệu giao dịch cần tạo
 * @returns Transaction đã tạo
 */
export const createTransaction = async (
  data: CreateTransactionRequest
): Promise<Transaction> => {
  const response = await axiosInstance.post<ApiResponse<Transaction>>(
    '/api/v1/transactions',
    data
  );
  return response.data.data;
};
