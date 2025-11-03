import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export interface Account {
  id: number;
  bank_name: string;
  account_type: string;
  branch_name: string;
  account_number: string;
  balance: number;
}

export interface AccountsResponse {
  user_id: number;
  accounts: Account[];
}

export interface CreateAccountRequest {
  bank_name: string;
  account_type: 'Checking' | 'Credit Card' | 'Savings' | 'Investment' | 'Loan';
  branch_name?: string;
  account_number_full: string;
  balance: number;
}

export interface CreateAccountResponse {
  id: number;
  user_id: number;
  bank_name: string;
  account_type: string;
  branch_name: string;
  account_number: string;
  balance: number;
}

/**
 * Lấy danh sách tài khoản
 */
export const getAccounts = async (): Promise<AccountsResponse> => {
  const response = await axiosInstance.get<ApiResponse<AccountsResponse>>('/v1/accounts');
  return response.data.data;
};

/**
 * Lấy chi tiết tài khoản theo ID
 */
export interface AccountDetail {
  id: number;
  bank_name: string;
  account_type: string;
  branch_name: string;
  account_number_full: string;
  balance: number;
  recent_transactions: Array<{
    date: string;
    amount: number;
    description: string;
  }>;
  total_transactions: number;
  has_more: boolean;
}

export interface AccountDetailResponse {
  success: boolean;
  message: string;
  data: AccountDetail;
}

export const getAccountDetail = async (id: number, limit: number = 5, offset: number = 0): Promise<AccountDetailResponse> => {
  const response = await axiosInstance.get<ApiResponse<AccountDetail>>(`/v1/accounts/${id}`, {
    params: { limit, offset },
  });
  return {
    success: response.data.success,
    message: response.data.message,
    data: response.data.data,
  };
};

/**
 * Tạo tài khoản mới
 */
export const createAccount = async (
  data: CreateAccountRequest
): Promise<{ success: boolean; message: string; data: CreateAccountResponse }> => {
  const response = await axiosInstance.post<ApiResponse<CreateAccountResponse>>(
    '/v1/accounts',
    data
  );
  return {
    success: response.data.success,
    message: response.data.message,
    data: response.data.data,
  };
};

/**
 * Update Account Request Interface
 */
export interface UpdateAccountRequest {
  bank_name?: string;
  account_type?: 'Checking' | 'Credit Card' | 'Savings' | 'Investment' | 'Loan';
  branch_name?: string;
  account_number_full?: string;
  balance?: number;
}

/**
 * Update Account Response Interface
 */
export interface UpdateAccountResponse {
  account_id: number;
  user_id: number;
  bank_name: string;
  account_type: string;
  branch_name: string;
  account_number_full: string;
  account_number_last_4: string;
  balance: number;
  updated_at: string;
}

/**
 * Cập nhật thông tin tài khoản
 */
export const updateAccount = async (
  id: number,
  data: UpdateAccountRequest
): Promise<{ success: boolean; message: string; data: UpdateAccountResponse }> => {
  const response = await axiosInstance.put<ApiResponse<UpdateAccountResponse>>(
    `/v1/accounts/${id}`,
    data
  );
  return {
    success: response.data.success,
    message: response.data.message,
    data: response.data.data,
  };
};

/**
 * Xóa tài khoản
 */
export const deleteAccount = async (id: number): Promise<{ message: string; deleted_account_id: number }> => {
  const response = await axiosInstance.delete<ApiResponse<{ deleted_account_id: number }>>(`/v1/accounts/${id}`);
  return {
    message: response.data.message || 'Account deleted successfully',
    deleted_account_id: response.data.data?.deleted_account_id || id,
  };
};
