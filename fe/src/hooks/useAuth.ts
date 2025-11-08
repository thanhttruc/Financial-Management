import { useState, useEffect } from 'react';

/**
 * Custom hook để quản lý trạng thái authentication
 * @returns { isAuthenticated, user, logout } - Trạng thái đăng nhập, thông tin user, và hàm đăng xuất
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Kiểm tra trạng thái đăng nhập khi component mount hoặc khi localStorage thay đổi
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (token) {
        setIsAuthenticated(true);
        if (userStr) {
          try {
            setUser(JSON.parse(userStr));
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Kiểm tra ngay lập tức
    checkAuth();

    // Lắng nghe sự kiện storage để cập nhật khi có thay đổi từ tab/window khác
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event để cập nhật khi đăng nhập/đăng xuất trong cùng tab
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  /**
   * Hàm đăng xuất: Xóa token và user info, cập nhật state
   */
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    // Dispatch custom event để các component khác biết đã đăng xuất
    window.dispatchEvent(new Event('auth-change'));
  };

  return {
    isAuthenticated,
    user,
    logout,
  };
};

