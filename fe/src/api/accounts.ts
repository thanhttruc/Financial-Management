import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export enum AccountType {
  CHECKING = 'Checking',
  CREDIT_CARD = 'Credit Card',
  SAVINGS = 'Savings',
  INVESTMENT = 'Investment',
  LOAN = 'Loan',
}

export interface Account {
  accountId: number;
  userId: number;
  bankName: string | null;
  accountType: AccountType;
  branchName: string | null;
  accountNumberFull: string | null;
  accountNumberLast4: string | null;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy danh sách tài khoản của user hiện tại
 */
export const getAccounts = async (): Promise<Account[]> => {
  const response = await axiosInstance.get<ApiResponse<Account[]>>('/api/v1/accounts');
  return response.data.data;
};

/**
 * Tạo tài khoản mới
 */
export const createAccount = async (
  data: Omit<Account, 'accountId' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Account> => {
  const response = await axiosInstance.post<ApiResponse<Account>>(
    '/api/v1/accounts',
    data
  );
  return response.data.data;
};

/**
 * Interface cho dữ liệu cập nhật tài khoản
 */
export interface UpdateAccountData {
  bankName?: string;
  accountType?: AccountType;
  branchName?: string;
  accountNumberFull?: string;
  balance?: number;
}

/**
 * Cập nhật tài khoản
 */
export const updateAccount = async (
  id: number,
  data: UpdateAccountData
): Promise<Account> => {
  const response = await axiosInstance.put<ApiResponse<Account>>(
    `/api/v1/accounts/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Xóa tài khoản
 */
export const deleteAccount = async (id: number): Promise<void> => {
  await axiosInstance.delete<ApiResponse<void>>(`/api/v1/accounts/${id}`);
};

/**
 * Interface cho giao dịch gần nhất
 */
export interface RecentTransaction {
  date: string;
  amount: number;
  description: string;
}

/**
 * Interface cho chi tiết tài khoản
 */
export interface AccountDetails {
  id: number;
  bank_name: string;
  account_type: AccountType;
  branch_name: string;
  account_number_full: string;
  balance: number;
  recent_transactions: RecentTransaction[];
}

/**
 * Lấy chi tiết tài khoản kèm 5 giao dịch gần nhất
 */
export const getAccountDetails = async (id: number): Promise<AccountDetails> => {
  const response = await axiosInstance.get<AccountDetails>(`/api/v1/accounts/${id}`);
  return response.data;
};
