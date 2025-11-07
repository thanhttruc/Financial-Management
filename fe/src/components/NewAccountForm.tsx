import React, { useState } from 'react';
import { createAccount, AccountType } from '../api/accounts';
import { Button } from './Button';
import { Card } from './Card';
import { Toast, useToast } from './Toast';

interface NewAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Component form thêm tài khoản mới
 */
export const NewAccountForm: React.FC<NewAccountFormProps> = ({ onSuccess, onCancel }) => {
  const { toast, showToast, hideToast } = useToast();
  
  // State cho các trường input
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: AccountType.CHECKING,
    branchName: '',
    accountNumberFull: '',
    balance: '',
  });

  // State cho loading
  const [isLoading, setIsLoading] = useState(false);

  // State cho errors theo từng trường
  const [errors, setErrors] = useState<{
    bankName?: string;
    accountType?: string;
    branchName?: string;
    accountNumberFull?: string;
    balance?: string;
  }>({});

  /**
   * Hàm xử lý thay đổi input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi user bắt đầu nhập lại
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * Hàm xử lý submit form - tạo tài khoản mới
   */
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});

    // Validate client-side cơ bản
    const newErrors: typeof errors = {};
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Tên ngân hàng không được để trống';
    }
    if (!formData.accountNumberFull.trim()) {
      newErrors.accountNumberFull = 'Số tài khoản đầy đủ không được để trống';
    }
    const balanceNum = parseFloat(formData.balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      newErrors.balance = 'Số dư khởi tạo phải là số và lớn hơn hoặc bằng 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Gọi API tạo tài khoản
      await createAccount({
        bankName: formData.bankName.trim(),
        accountType: formData.accountType,
        branchName: formData.branchName.trim() || undefined,
        accountNumberFull: formData.accountNumberFull.trim(),
        balance: balanceNum,
      });

      // Thành công: hiển thị Toast và đóng form
      showToast('Tạo tài khoản thành công', 'success');
      
      // Reset form
      setFormData({
        bankName: '',
        accountType: AccountType.CHECKING,
        branchName: '',
        accountNumberFull: '',
        balance: '',
      });

      // Gọi callback onSuccess nếu có
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errorData = err.response?.data;

      // Xử lý lỗi 400 BadRequest - hiển thị lỗi dưới các trường input
      if (status === 400) {
        const errorMessage = errorData?.message || 'Dữ liệu không hợp lệ';
        
        // Parse error message để hiển thị đúng trường
        if (errorMessage.includes('Số dư') || errorMessage.includes('balance')) {
          setErrors((prev) => ({ ...prev, balance: errorMessage }));
        } else if (errorMessage.includes('Tên ngân hàng') || errorMessage.includes('bankName')) {
          setErrors((prev) => ({ ...prev, bankName: errorMessage }));
        } else if (errorMessage.includes('Số tài khoản') || errorMessage.includes('accountNumberFull')) {
          setErrors((prev) => ({ ...prev, accountNumberFull: errorMessage }));
        } else if (errorMessage.includes('Loại tài khoản') || errorMessage.includes('accountType')) {
          setErrors((prev) => ({ ...prev, accountType: errorMessage }));
        } else {
          // Nếu không parse được, hiển thị Toast
          showToast(errorMessage, 'error');
        }
      } 
      // Xử lý lỗi 500 hoặc lỗi server khác
      else if (status >= 500 || !status) {
        showToast('Lỗi hệ thống, vui lòng thử lại sau.', 'error');
      }
      // Xử lý các lỗi khác (401, 403, etc.)
      else {
        const errorMessage = errorData?.message || 'Đã xảy ra lỗi khi tạo tài khoản';
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thêm tài khoản mới</h2>
          <p className="text-gray-600 mt-2">Điền thông tin tài khoản của bạn</p>
        </div>

        <form onSubmit={handleAddAccount} className="space-y-6">
          {/* Tên Ngân hàng */}
          <div>
            <label
              htmlFor="bankName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Tên Ngân hàng <span className="text-red-500">*</span>
            </label>
            <input
              id="bankName"
              name="bankName"
              type="text"
              value={formData.bankName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                errors.bankName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ví dụ: Vietcombank, Techcombank"
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>

          {/* Loại tài khoản */}
          <div>
            <label
              htmlFor="accountType"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Loại tài khoản <span className="text-red-500">*</span>
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 bg-white ${
                errors.accountType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value={AccountType.CHECKING}>Checking</option>
              <option value={AccountType.CREDIT_CARD}>Credit Card</option>
              <option value={AccountType.SAVINGS}>Savings</option>
              <option value={AccountType.INVESTMENT}>Investment</option>
              <option value={AccountType.LOAN}>Loan</option>
            </select>
            {errors.accountType && (
              <p className="mt-1 text-sm text-red-600">{errors.accountType}</p>
            )}
          </div>

          {/* Chi nhánh */}
          <div>
            <label
              htmlFor="branchName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Chi nhánh
            </label>
            <input
              id="branchName"
              name="branchName"
              type="text"
              value={formData.branchName}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                errors.branchName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ví dụ: Chi nhánh Hà Nội"
            />
            {errors.branchName && (
              <p className="mt-1 text-sm text-red-600">{errors.branchName}</p>
            )}
          </div>

          {/* Số tài khoản đầy đủ */}
          <div>
            <label
              htmlFor="accountNumberFull"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Số tài khoản đầy đủ <span className="text-red-500">*</span>
            </label>
            <input
              id="accountNumberFull"
              name="accountNumberFull"
              type="text"
              value={formData.accountNumberFull}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 font-mono ${
                errors.accountNumberFull ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ví dụ: 9704221234567890123"
            />
            {errors.accountNumberFull && (
              <p className="mt-1 text-sm text-red-600">{errors.accountNumberFull}</p>
            )}
          </div>

          {/* Số dư khởi tạo */}
          <div>
            <label
              htmlFor="balance"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Số dư khởi tạo <span className="text-red-500">*</span>
            </label>
            <input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                errors.balance ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.balance && (
              <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="relative"
            >
              {isLoading ? (
                <span className="flex items-center">
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang tạo...
                </span>
              ) : (
                'Tạo tài khoản'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
};

