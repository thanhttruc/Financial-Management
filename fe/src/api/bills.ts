import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export interface Bill {
  billId: number;
  userId: number;
  dueDate: string; // ISO date string
  logoUrl: string | null;
  itemDescription: string;
  lastChargeDate: string | null; // ISO date string
  amount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy danh sách hóa đơn sắp tới của user hiện tại
 * Authorization header được tự động thêm từ localStorage.accessToken
 * thông qua axiosInstance interceptor
 */
export const getUpcomingBills = async (): Promise<Bill[]> => {
  const response = await axiosInstance.get<ApiResponse<Bill[]>>('/api/v1/bills');
  return response.data.data;
};

