import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export type MonthlyExpenseSummary = {
  month: string; // Format: "Jan 2024"
  totalExpense: number;
};

export type ExpenseItemDetail = {
  itemDescription: string;
  amount: number;
  transactionDate: string; // Format: YYYY-MM-DD
};

export type ExpenseBreakdownItem = {
  categoryId: number;
  categoryName: string;
  total: number;
  changePercent: number;
  items: ExpenseItemDetail[];
};

/**
 * Lấy tổng chi tiêu theo tháng của user hiện tại
 * @returns Mảng các object chứa month và totalExpense
 */
export const getMonthlyExpenseSummary = async (): Promise<MonthlyExpenseSummary[]> => {
  const response = await axiosInstance.get<ApiResponse<MonthlyExpenseSummary[]>>(
    '/api/v1/expenses/summary'
  );
  return response.data.data;
};

/**
 * Lấy breakdown chi tiêu theo danh mục cho tháng được chỉ định
 * @param month Tháng cần lấy breakdown (format: YYYY-MM)
 * @returns Mảng các object chứa categoryId, categoryName, total, changePercent, items
 */
export const getExpenseBreakdown = async (month: string): Promise<ExpenseBreakdownItem[]> => {
  const response = await axiosInstance.get<ApiResponse<ExpenseBreakdownItem[]>>(
    `/api/v1/expenses/breakdown?month=${month}`
  );
  return response.data.data;
};

