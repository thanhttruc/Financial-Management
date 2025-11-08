import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationForm } from '../components/RegistrationForm';
import { ENV } from '../config/env';

/**
 * RegistrationPage: Trang đăng ký người dùng mới
 * Thiết kế theo Figma: Finebank Financial Management Dashboard
 */
export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/App Name */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{ENV.APP_NAME}</h1>
          <p className="text-gray-600">Tạo tài khoản mới</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <RegistrationForm />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Đã có tài khoản?{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

