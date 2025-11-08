import { axiosInstance } from './axiosInstance';

/**
 * Interface cho request đăng nhập
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface cho request đăng ký
 */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Interface cho response đăng nhập thành công
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      userId: number;
      email: string;
      fullName: string;
      username: string;
    };
  };
}

/**
 * Auth API Service
 * Xử lý các API call liên quan đến xác thực
 */
export const authService = {
  /**
   * Đăng nhập người dùng
   * @param credentials - Thông tin đăng nhập (email, password)
   * @returns Access token và thông tin user
   * @throws Error nếu có lỗi CORS hoặc lỗi khác
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // Xử lý lỗi CORS cụ thể
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra CORS và đảm bảo server đang chạy.');
      }
      // Xử lý lỗi CORS từ response
      if (error.response?.status === 0 || error.message?.includes('CORS')) {
        throw new Error('Lỗi CORS: Server không cho phép truy cập từ origin này.');
      }
      // Ném lại lỗi gốc để xử lý ở component
      throw error;
    }
  },

  /**
   * Đăng ký người dùng mới
   * @param registerData - Thông tin đăng ký (fullName, email, password, confirmPassword)
   * @returns Access token và thông tin user
   * @throws Error nếu có lỗi
   */
  register: async (registerData: RegisterRequest): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/register', registerData);
      return response.data;
    } catch (error: any) {
      // Xử lý lỗi CORS cụ thể
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra CORS và đảm bảo server đang chạy.');
      }
      // Xử lý lỗi CORS từ response
      if (error.response?.status === 0 || error.message?.includes('CORS')) {
        throw new Error('Lỗi CORS: Server không cho phép truy cập từ origin này.');
      }
      // Ném lại lỗi gốc để xử lý ở component
      throw error;
    }
  },
};

