import { axiosInstance } from './axiosInstance';

export type MonthlyExpense = { month: string; totalExpense: number };

export type ExpenseBreakdownItem = {
  category: string;
  total: number;
  changePercent: number;
  subCategories: Array<{ name: string; amount: number; date: string }>;
};

export async function getMonthlyExpensesSummary(userId?: number) {
  // Backend sẽ lấy userId từ JWT token, không cần gửi userId param
  // Gửi userId nếu có để tương thích, nhưng không bắt buộc
  const params = userId ? { userId } : {};
  const res = await axiosInstance.get('/v1/expenses/summary', { params });
  return res.data as { success?: boolean; message?: string; data: MonthlyExpense[] };
}

export async function getExpenseBreakdown(userId?: number, month?: string) {
  // month format: "YYYY-MM" (ví dụ: "2025-05")
  // Nếu không có month thì backend sẽ dùng tháng hiện tại
  const params: Record<string, string | number> = {};
  if (userId) params.userId = userId;
  if (month) params.month = month;
  const res = await axiosInstance.get('/v1/expenses/breakdown', { params });
  return res.data as { success?: boolean; message?: string; data: ExpenseBreakdownItem[] };
}


