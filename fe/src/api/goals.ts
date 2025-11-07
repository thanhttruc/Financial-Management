import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export type SavingGoal = {
  goal_id: number;
  goal_type: string;
  target_amount: number;
  target_achieved: number;
  present_amount: number | null;
  start_date: string;
  end_date: string;
};

export type ExpenseGoal = {
  goal_id: number;
  category: string;
  target_amount: number;
};

export type UserGoals = {
  savingGoal: SavingGoal | null;
  expenseGoals: ExpenseGoal[];
};

export enum GoalType {
  SAVING = 'Saving',
  EXPENSE_LIMIT = 'Expense_Limit',
}

export type CreateGoalRequest = {
  goal_type: GoalType;
  category_id?: number | null;
  start_date: string;
  end_date: string;
  target_amount: number;
  target_archived?: number;
};

export type CreateGoalResponse = {
  goal_id: number;
};

export type UpdateGoalRequest = {
  target_amount: number;
  archived_amount: number;
};

export type UpdateGoalResponse = {
  goal_id: number;
  target_amount: number;
  archived_amount: number;
};

/**
 * Lấy tất cả mục tiêu của user hiện tại (đã phân loại thành savingGoal và expenseGoals)
 * @returns Object chứa savingGoal và expenseGoals
 */
export const getUserGoals = async (): Promise<UserGoals> => {
  const response = await axiosInstance.get<ApiResponse<UserGoals>>(
    '/api/v1/goals'
  );
  return response.data.data;
};

/**
 * Tạo mục tiêu mới
 * @param goalData Dữ liệu mục tiêu cần tạo
 * @returns Object chứa goal_id
 */
export const createGoal = async (goalData: CreateGoalRequest): Promise<CreateGoalResponse> => {
  const response = await axiosInstance.post<ApiResponse<CreateGoalResponse>>(
    '/api/v1/goals',
    goalData
  );
  return response.data.data;
};

/**
 * Cập nhật mục tiêu
 * @param goalId ID của mục tiêu cần cập nhật
 * @param updateData Dữ liệu cập nhật (target_amount và archived_amount)
 * @returns Object chứa updated_goal
 */
export const updateGoal = async (
  goalId: number,
  updateData: UpdateGoalRequest
): Promise<UpdateGoalResponse> => {
  const response = await axiosInstance.put<{ message: string; updated_goal: UpdateGoalResponse }>(
    `/api/v1/goals/${goalId}`,
    updateData
  );
  return response.data.updated_goal;
};

