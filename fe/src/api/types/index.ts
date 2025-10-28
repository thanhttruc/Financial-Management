/**
 * Định nghĩa các kiểu dữ liệu chung cho API
 */

// Response chuẩn từ backend
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
