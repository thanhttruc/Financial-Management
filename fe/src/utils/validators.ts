/**
 * Các hàm validation chung
 */

/**
 * Kiểm tra email hợp lệ
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra số điện thoại VN hợp lệ
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
  return phoneRegex.test(phone);
};

/**
 * Kiểm tra chuỗi không rỗng
 */
export const isNotEmpty = (str: string): boolean => {
  return str.trim().length > 0;
};
