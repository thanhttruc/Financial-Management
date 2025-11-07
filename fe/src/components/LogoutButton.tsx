import React, { useState } from 'react';
import { logout } from '../api/auth';
import { Button } from './Button';

/**
 * Component button đăng xuất
 * Hiển thị ở góc phải màn hình khi người dùng đã đăng nhập
 */
export const LogoutButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Hàm xử lý đăng xuất
   * Hậu điều kiện:
   * 1. Set isLoading=true (Phản hồi hệ thống)
   * 2. XÓA accessToken khỏi localStorage
   * 3. Chuyển hướng người dùng đến trang /
   * 4. Tắt isLoading sau khi hoàn thành
   */
  const handleLogout = async (): Promise<void> => {
    // 1. Set isLoading=true (Phản hồi hệ thống)
    setIsLoading(true);

    try {
      // 2. XÓA accessToken khỏi localStorage
      logout();

      // 3. Chuyển hướng người dùng đến trang /
      // Sử dụng window.location để đảm bảo trang reload hoàn toàn và cập nhật trạng thái
      window.location.href = '/';
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      // 4. Đảm bảo trạng thái isLoading được tắt đi ngay cả khi có lỗi
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleLogout}
      disabled={isLoading}
      className="ml-auto"
    >
      {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
    </Button>
  );
};

