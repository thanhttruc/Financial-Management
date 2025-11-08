import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import { ENV } from '../config/env';

/**
 * LoginPage: Trang đăng nhập người dùng
 * Thiết kế theo Figma: Finebank Financial Management Dashboard
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Gọi API đăng nhập
      const response = await authService.login({ email, password });

      // Lưu accessToken vào localStorage
      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // Lưu thông tin user nếu cần
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // Dispatch event để Navigation component cập nhật
        window.dispatchEvent(new Event('auth-change'));

        // Điều hướng đến trang chủ
        navigate('/');
      }
    } catch (err: any) {
      // Xử lý lỗi STRICTLY
      if (err.response?.status === 401) {
        // Lỗi 401: Email hoặc mật khẩu không đúng
        setError('Email hoặc mật khẩu không đúng.');
      } else if (err.response?.status >= 500 || err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        // Lỗi mạng / Server: Timeout hoặc lỗi 500
        setError('Không thể kết nối, vui lòng thử lại.');
      } else {
        // Lỗi khác
        setError(err.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/App Name */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{ENV.APP_NAME}</h1>
          <p className="text-gray-600">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập email của bạn"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu của bạn"
                disabled={isLoading}
              />
            </div>

            {/* Keep me signed in & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="keepMeSignedIn"
                  type="checkbox"
                  checked={keepMeSignedIn}
                  onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="keepMeSignedIn" className="ml-2 block text-sm text-gray-700">
                  Keep me signed in
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement forgot password functionality
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
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
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Chưa có tài khoản?{' '}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
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
    </div>
  );
};

