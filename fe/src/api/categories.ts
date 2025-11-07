import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from './types';

export type Category = {
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Lấy danh sách tất cả categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<ApiResponse<Category[]>>('/api/v1/categories');
  return response.data.data;
};

