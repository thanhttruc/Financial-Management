import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export interface SavingGoal {
  goal_id: number;
  goal_type: string;
  target_amount: number;
  target_achieved: number;
  present_amount: number | null;
  start_date: string;
  end_date: string;
}

export interface ExpenseGoal {
  goal_id: number;
  category: string;
  target_amount: number;
}

export interface GoalsResponse {
  savingGoal: SavingGoal | null;
  expenseGoals: ExpenseGoal[];
}

export interface MonthlySavings {
  month: string;
  amount: number;
}

export interface SavingsSummaryResponse {
  user_id: number;
  year: number;
  summary: {
    this_year: MonthlySavings[];
    last_year: MonthlySavings[];
  };
}

export interface CreateGoalRequest {
  goal_type: 'Saving' | 'Expense_Limit';
  category_id?: number | null;
  start_date: string;
  end_date: string;
  target_amount: number;
  target_archived?: number;
}

export interface CreateGoalResponse {
  goal_id: number;
}

export interface UpdateGoalRequest {
  target_amount: number;
  archived_amount?: number;
}

export interface UpdateGoalResponse {
  goal_id: number;
  target_amount: number;
  archived_amount: number;
}

/**
 * Lấy danh sách mục tiêu tài chính
 * @param month - Tháng định dạng "YYYY-MM" (ví dụ: "2025-01"), optional
 */
export const getGoals = async (month?: string): Promise<GoalsResponse> => {
  // Kiểm tra token trước khi gọi API
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('[Goals] No token found in localStorage');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const params = month ? { month } : {};
    const response = await axiosInstance.get<ApiResponse<GoalsResponse>>('/v1/goals', {
      params,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('[Goals] Error fetching goals:', error);
    
    // Nếu là lỗi 401, có thể token không hợp lệ
    if (error.response?.status === 401) {
      console.error('[Goals] Unauthorized - Token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    
    throw error;
  }
};

/**
 * Lấy tổng kết tiết kiệm theo từng tháng trong năm
 * @param year - Năm cần xem (ví dụ: 2025), optional (mặc định là năm hiện tại)
 */
export const getSavingsSummary = async (year?: number): Promise<SavingsSummaryResponse> => {
  // Kiểm tra token trước khi gọi API
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('[Goals] No token found in localStorage');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const params = year ? { year } : {};
    const response = await axiosInstance.get<ApiResponse<SavingsSummaryResponse>>('/v1/goals/summary', {
      params,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('[Goals] Error fetching savings summary:', error);
    
    // Nếu là lỗi 401, có thể token không hợp lệ
    if (error.response?.status === 401) {
      console.error('[Goals] Unauthorized - Token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    
    throw error;
  }
};

/**
 * Tạo mới một mục tiêu tài chính
 * @param goalData - Dữ liệu mục tiêu cần tạo
 */
export const createGoal = async (goalData: CreateGoalRequest): Promise<CreateGoalResponse> => {
  // Kiểm tra token trước khi gọi API
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('[Goals] No token found in localStorage');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axiosInstance.post<ApiResponse<CreateGoalResponse>>('/v1/goals', goalData);
    return response.data.data;
  } catch (error: any) {
    console.error('[Goals] Error creating goal:', error);
    
    // Nếu là lỗi 401, có thể token không hợp lệ
    if (error.response?.status === 401) {
      console.error('[Goals] Unauthorized - Token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    
    throw error;
  }
};

/**
 * Cập nhật mục tiêu tài chính
 * @param goalId - ID của mục tiêu cần cập nhật
 * @param goalData - Dữ liệu cập nhật (target_amount và archived_amount)
 */
export const updateGoal = async (goalId: number, goalData: UpdateGoalRequest): Promise<UpdateGoalResponse> => {
  // Kiểm tra token trước khi gọi API
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('[Goals] No token found in localStorage');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axiosInstance.put<ApiResponse<{ updated_goal: UpdateGoalResponse }>>(
      `/v1/goals/${goalId}`,
      goalData
    );
    return response.data.data.updated_goal;
  } catch (error: any) {
    console.error('[Goals] Error updating goal:', error);
    
    // Nếu là lỗi 401, có thể token không hợp lệ
    if (error.response?.status === 401) {
      console.error('[Goals] Unauthorized - Token may be invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    
    throw error;
  }
};

