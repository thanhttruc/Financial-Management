import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { Button } from '../components/Button';
import { Toast, useToast } from '../components/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm xử lý đăng nhập
   * Hậu điều kiện:
   * 1. Set isLoading=true (Phản hồi hệ thống)
   * 2. Gọi API POST /auth/login
   * 3. Nếu thành công, LƯU accessToken vào localStorage
   * 4. Điều hướng đến trang chủ '/'
   */
  const handleLogin = async (): Promise<void> => {
    // 1. Set isLoading=true (Phản hồi hệ thống)
    setIsLoading(true);
    setError(null);

    try {
      // 2. Gọi API POST /auth/login
      const response = await login({ email, password });
      
      // 3. Nếu thành công, LƯU accessToken vào localStorage
      localStorage.setItem('accessToken', response.token);
      
      // Lưu thêm thông tin user nếu cần
      if (keepMeSignedIn) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      // 4. Điều hướng đến trang chủ '/'
      navigate('/');
    } catch (err: any) {
      // Xử lý lỗi STRICTLY theo yêu cầu
      const status = err.response?.status;
      
      // Kiểm tra lỗi mạng/timeout (không có response từ server)
      const isNetworkError = 
        !err.response || 
        err.code === 'ECONNABORTED' || 
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('timeout');

      // Xử lý Lỗi mạng / Server: Nếu API timeout hoặc lỗi 500
      if (isNetworkError || status === 500) {
        // Hiển thị toast 'Không thể kết nối, vui lòng thử lại.'
        showToast('Không thể kết nối, vui lòng thử lại.', 'error');
      } 
      // Nếu API trả về lỗi 401 hoặc lỗi Server (validation errors, etc.)
      else if (status === 401) {
        // Hiển thị chính xác thông báo lỗi: 'Email hoặc mật khẩu không đúng.' (Phản ứng hệ thống)
        // ngay dưới form (vị trí đã xác định)
        setError('Email hoặc mật khẩu không đúng.');
      }
      // Các lỗi khác (400, 403, 404, etc.)
      else {
        const errorMessage = 
          err.response?.data?.error || 
          err.response?.data?.message ||
          err.message || 
          'Đăng nhập thất bại. Vui lòng thử lại.';
        setError(errorMessage);
      }
    } finally {
      // Đảm bảo trạng thái isLoading được tắt đi trong mọi trường hợp lỗi
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="w-full max-w-md">
        {/* Logo và Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-gray-600">
            Đăng nhập để tiếp tục quản lý tài chính của bạn
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="nhập email của bạn"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 pr-12"
                  placeholder="nhập mật khẩu của bạn"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.29 3.29L12 12m0 0l3.29 3.29m-3.29-3.29L12 12m0 0v-.001m0 0L8.71 8.71"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Keep me signed in & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={keepMeSignedIn}
                  onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                  Giữ tôi đăng nhập
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement forgot password
                }}
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">hoặc</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a
                href="#"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          © 2025 Financial Management. Bảo mật thông tin của bạn là ưu tiên hàng đầu.
        </p>
      </div>
    </div>
  );
};

