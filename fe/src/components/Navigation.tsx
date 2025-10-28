import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ENV } from '../config/env';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: '🏠' },
    { path: '/transactions', label: 'Giao dịch', icon: '💰' },
    { path: '/accounts', label: 'Tài khoản', icon: '💳' },
    { path: '/categories', label: 'Danh mục', icon: '📁' },
    { path: '/goals', label: 'Mục tiêu', icon: '🎯' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              {ENV.APP_NAME}
            </Link>
            
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
