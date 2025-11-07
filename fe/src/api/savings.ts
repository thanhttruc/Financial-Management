import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export type MonthlySavingData = {
  month: string; // Format: "01" to "12"
  saving: number; // Revenue - Expense
};

export type SavingSummaryResponse = {
  this_year: MonthlySavingData[];
  last_year: MonthlySavingData[];
};

/**
 * Lấy tổng hợp tiết kiệm theo năm (Revenue - Expense) và so sánh với năm trước
 * @param year Năm cần lấy dữ liệu
 * @returns Object chứa this_year và last_year với dữ liệu theo tháng (01-12)
 */
export const getSavingSummary = async (year: number): Promise<SavingSummaryResponse> => {
  const response = await axiosInstance.get<ApiResponse<SavingSummaryResponse>>(
    `/api/v1/savings/summary?year=${year}`
  );
  return response.data.data;
};

