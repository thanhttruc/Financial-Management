import React, { useState, useEffect } from 'react';
import { updateGoal, type UpdateGoalRequest } from '../api/goals';
import { Button } from './Button';
import { Toast, useToast } from './Toast';

interface AdjustGoalModalProps {
  isOpen: boolean;
  goalId: number;
  targetAmount: number;
  archivedAmount: number;
  onClose: () => void;
  onGoalUpdated?: () => void;
}

/**
 * Component Modal điều chỉnh mục tiêu
 * Thiết kế theo phong cách Figma Finebank Financial Management Dashboard
 */
export const AdjustGoalModal: React.FC<AdjustGoalModalProps> = ({
  isOpen,
  goalId,
  targetAmount,
  archivedAmount,
  onClose,
  onGoalUpdated,
}) => {
  const { toast, showToast, hideToast } = useToast();

  // State cho các trường input
  const [formData, setFormData] = useState<UpdateGoalRequest>({
    target_amount: targetAmount,
    archived_amount: archivedAmount,
  });

  // State cho loading khi submit
  const [isLoading, setIsLoading] = useState(false);

  // State cho errors theo từng trường
  const [errors, setErrors] = useState<{
    target_amount?: string;
    archived_amount?: string;
    general?: string;
  }>({});

  // Pre-fill form với dữ liệu hiện tại khi modal mở hoặc props thay đổi
  useEffect(() => {
    if (isOpen) {
      setFormData({
        target_amount: targetAmount,
        archived_amount: archivedAmount,
      });
      setErrors({});
    }
  }, [isOpen, targetAmount, archivedAmount]);

  /**
   * Hàm xử lý thay đổi input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Xử lý số tiền để chuyển sang number
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));

    // Xóa lỗi khi user bắt đầu nhập lại
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // Xóa lỗi general khi user thay đổi bất kỳ trường nào
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  /**
   * Hàm xử lý lưu - gửi request PUT để cập nhật mục tiêu
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate client-side cơ bản
    const newErrors: typeof errors = {};

    // Validation số tiền mục tiêu: phải là số dương và lớn hơn 0
    if (!formData.target_amount || formData.target_amount <= 0 || isNaN(formData.target_amount)) {
      newErrors.target_amount = 'Số tiền mục tiêu phải là số dương và lớn hơn 0';
    }

    // Validation số tiền đã đạt được: phải lớn hơn hoặc bằng 0
    if (formData.archived_amount < 0 || isNaN(formData.archived_amount)) {
      newErrors.archived_amount = 'Số tiền đã đạt được phải lớn hơn hoặc bằng 0';
    }

    // Validation: archived_amount KHÔNG ĐƯỢC LỚN HƠN target_amount
    if (formData.archived_amount > formData.target_amount) {
      newErrors.archived_amount = 'Số tiền đã đạt được không được lớn hơn số tiền mục tiêu';
    }

    // Nếu có lỗi validation, hiển thị và dừng lại
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Gọi API cập nhật mục tiêu
      await updateGoal(goalId, formData);

      // Thành công: hiển thị Toast và đóng Modal
      showToast('Goal updated successfully', 'success');

      // Gọi callback onGoalUpdated nếu có để refresh dữ liệu
      if (onGoalUpdated) {
        setTimeout(() => {
          onGoalUpdated();
        }, 500);
      }

      // Đóng Modal sau khi hiển thị toast
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      const status = err.response?.status;
      const errorData = err.response?.data;

      // Xử lý lỗi 400 BadRequest - hiển thị lỗi validation
      if (status === 400) {
        const errorMessage = errorData?.message || 'Dữ liệu không hợp lệ';

        // Parse error message để hiển thị đúng trường
        if (
          errorMessage.includes('Số tiền mục tiêu') ||
          errorMessage.includes('target_amount') ||
          errorMessage.includes('Target amount')
        ) {
          setErrors((prev) => ({ ...prev, target_amount: errorMessage }));
        } else if (
          errorMessage.includes('Số tiền đã đạt được') ||
          errorMessage.includes('archived_amount') ||
          errorMessage.includes('Archived amount') ||
          errorMessage.includes('không được lớn hơn')
        ) {
          setErrors((prev) => ({ ...prev, archived_amount: errorMessage }));
        } else {
          // Hiển thị lỗi general ở đầu form
          setErrors((prev) => ({ ...prev, general: errorMessage }));
        }
      }
      // Xử lý lỗi 403/404 - Mục tiêu không tồn tại hoặc không có quyền
      else if (status === 403 || status === 404) {
        showToast('Lỗi khi cập nhật mục tiêu. Vui lòng kiểm tra lại.', 'error');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
      // Xử lý lỗi 401 - Unauthorized
      else if (status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // Xử lý lỗi 500 hoặc lỗi server khác
      else if (status >= 500 || !status) {
        showToast('Lỗi khi cập nhật mục tiêu. Vui lòng kiểm tra lại.', 'error');
      }
      // Xử lý các lỗi khác
      else {
        const errorMessage = errorData?.message || 'Lỗi khi cập nhật mục tiêu. Vui lòng kiểm tra lại.';
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Điều chỉnh mục tiêu</h2>
            <p className="text-sm text-gray-600 mt-1">Cập nhật số tiền mục tiêu và số tiền đã đạt được</p>
          </div>

          {/* Content */}
          <form onSubmit={handleSave} className="px-6 py-4">
            {/* Hiển thị lỗi general ở đầu form */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Số tiền mục tiêu */}
              <div>
                <label
                  htmlFor="target_amount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Số tiền mục tiêu <span className="text-red-500">*</span>
                </label>
                <input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.target_amount || ''}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.target_amount ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Nhập số tiền mục tiêu"
                />
                {errors.target_amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_amount}</p>
                )}
              </div>

              {/* Số tiền đã đạt được */}
              <div>
                <label
                  htmlFor="archived_amount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Số tiền đã đạt được <span className="text-red-500">*</span>
                </label>
                <input
                  id="archived_amount"
                  name="archived_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.archived_amount || ''}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.archived_amount ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Nhập số tiền đã đạt được"
                />
                {errors.archived_amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.archived_amount}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex space-x-3 justify-end">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                type="button"
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
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
                    Đang lưu...
                  </span>
                ) : (
                  'Lưu'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </>
  );
};

