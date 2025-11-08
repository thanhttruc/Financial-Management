import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';

/**
 * RegistrationForm: Component form đăng ký người dùng mới
 * Thiết kế theo Figma: Finebank Financial Management Dashboard
 */
export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  /**
   * Hàm xử lý đăng ký
   * Hậu điều kiện:
   * 1. Set isLoading=true (Phản hồi hệ thống)
   * 2. Kiểm tra password và confirmPassword (Client-side)
   * 3. Gọi API POST /auth/register
   * 4. Nếu thành công, LƯU accessToken vào localStorage
   * 5. Điều hướng đến trang chủ '/'
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setServerError(null);
    setIsLoading(true);

    try {
      // Client-Side Validation: Kiểm tra password và confirmPassword có trùng khớp không
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      // Gọi API đăng ký
      const response = await authService.register({
        fullName,
        email,
        password,
        confirmPassword,
      });

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
      if (err.response?.status === 409) {
        // Lỗi 409: Email đã tồn tại
        setServerError('This email is already registered.');
      } else if (err.response?.status === 400) {
        // Lỗi 400: Password không trùng khớp (từ server)
        const errorMessage = err.response?.data?.error || err.response?.data?.message;
        if (errorMessage?.includes('Passwords do not match')) {
          setPasswordError('Passwords do not match.');
        } else {
          setServerError(errorMessage || 'Đã xảy ra lỗi, vui lòng thử lại.');
        }
      } else if (err.response?.status >= 500 || err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        // Lỗi mạng / Server: Timeout hoặc lỗi 500
        setServerError('Không thể kết nối, vui lòng thử lại.');
      } else {
        // Lỗi khác
        setServerError(err.response?.data?.error || err.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {/* Full Name Input */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Họ và tên
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          placeholder="Nhập họ và tên của bạn"
          disabled={isLoading}
        />
      </div>

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

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Xác nhận mật khẩu
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            // Clear password error when user starts typing
            if (passwordError) {
              setPasswordError(null);
            }
          }}
          required
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
            passwordError ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Nhập lại mật khẩu"
          disabled={isLoading}
        />
        {/* Password Error Message - Hiển thị ngay dưới input Confirm Password */}
        {passwordError && (
          <p className="mt-2 text-sm text-red-600">{passwordError}</p>
        )}
      </div>

      {/* Server Error Message - Hiển thị ở vị trí nổi bật trên form */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 text-center">{serverError}</p>
        </div>
      )}

      {/* Sign Up Button */}
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
            Đang đăng ký...
          </span>
        ) : (
          'Sign up'
        )}
      </button>
    </form>
  );
};

