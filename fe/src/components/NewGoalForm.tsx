import React, { useState, useEffect } from 'react';
import { createGoal, GoalType, type CreateGoalRequest } from '../api/goals';
import { getCategories, type Category } from '../api/categories';
import { Button } from './Button';
import { Card } from './Card';
import { Toast, useToast } from './Toast';

interface NewGoalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Component form tạo mục tiêu mới
 * Form chứa các Input cho goal_type, target_amount, start_date, end_date
 * Trường category_id CHỈ hiển thị khi goal_type là 'Expense_Limit'
 */
export const NewGoalForm: React.FC<NewGoalFormProps> = ({ onSuccess, onCancel }) => {
  const { toast, showToast, hideToast } = useToast();

  // State cho các trường input
  const [formData, setFormData] = useState<CreateGoalRequest>({
    goal_type: GoalType.SAVING,
    category_id: null,
    start_date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    end_date: '',
    target_amount: 0,
    target_archived: 0,
  });

  // State cho danh sách categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // State cho loading khi submit
  const [isLoading, setIsLoading] = useState(false);

  // State cho errors theo từng trường
  const [errors, setErrors] = useState<{
    goal_type?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    target_amount?: string;
    target_archived?: string;
    general?: string;
  }>({});

  /**
   * Load danh sách categories khi component mount
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesList = await getCategories();
        setCategories(categoriesList);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        showToast('Không thể tải danh sách danh mục', 'error');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Hàm xử lý thay đổi input
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Xử lý riêng cho goal_type
    if (name === 'goal_type') {
      const newGoalType = value as GoalType;
      setFormData((prev) => ({
        ...prev,
        goal_type: newGoalType,
        // Reset category_id khi chuyển sang Saving
        category_id: newGoalType === GoalType.EXPENSE_LIMIT ? prev.category_id : null,
      }));
    } else if (name === 'target_amount' || name === 'target_archived') {
      // Xử lý số tiền để chuyển sang number
      const numValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (name === 'category_id') {
      // Xử lý category_id để chuyển sang number
      const numValue = value ? parseInt(value, 10) : null;
      setFormData((prev) => ({
        ...prev,
        category_id: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
   * Hàm xử lý tạo mục tiêu - gửi request POST để tạo mục tiêu mới
   */
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate client-side cơ bản
    const newErrors: typeof errors = {};
    
    // Validation số tiền mục tiêu: phải là số dương và lớn hơn 0
    if (!formData.target_amount || formData.target_amount <= 0 || isNaN(formData.target_amount)) {
      newErrors.target_amount = 'Số tiền mục tiêu phải là số dương và lớn hơn 0';
    }
    
    // Validation ngày bắt đầu
    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu không được để trống';
    }
    
    // Validation ngày kết thúc
    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc không được để trống';
    }
    
    // Validation: start_date phải trước end_date
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (startDate >= endDate) {
        newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }
    
    // Validation category_id: bắt buộc khi goal_type = Expense_Limit
    if (formData.goal_type === GoalType.EXPENSE_LIMIT && (!formData.category_id || formData.category_id === 0)) {
      newErrors.category_id = 'Danh mục không được để trống khi loại mục tiêu là Chi tiêu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Chuẩn bị dữ liệu gửi lên API
      const goalData: CreateGoalRequest = {
        goal_type: formData.goal_type,
        category_id: formData.goal_type === GoalType.EXPENSE_LIMIT ? formData.category_id : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        target_amount: formData.target_amount,
        target_archived: formData.target_archived || 0,
      };

      // Gọi API tạo mục tiêu
      await createGoal(goalData);

      // Thành công: hiển thị Toast và đóng form
      showToast('Goal created successfully', 'success');

      // Reset form
      setFormData({
        goal_type: GoalType.SAVING,
        category_id: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        target_amount: 0,
        target_archived: 0,
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

      // Xử lý lỗi 400 BadRequest - hiển thị lỗi validation
      if (status === 400) {
        const errorMessage = errorData?.message || 'Dữ liệu không hợp lệ';

        // Parse error message để hiển thị đúng trường
        if (errorMessage.includes('Số tiền mục tiêu') || errorMessage.includes('target_amount') || errorMessage.includes('Target amount')) {
          setErrors((prev) => ({ ...prev, target_amount: errorMessage }));
        } else if (errorMessage.includes('Ngày bắt đầu') || errorMessage.includes('start_date') || errorMessage.includes('Start date')) {
          setErrors((prev) => ({ ...prev, start_date: errorMessage }));
        } else if (errorMessage.includes('Ngày kết thúc') || errorMessage.includes('end_date') || errorMessage.includes('End date')) {
          setErrors((prev) => ({ ...prev, end_date: errorMessage }));
        } else if (errorMessage.includes('Danh mục') || errorMessage.includes('category_id') || errorMessage.includes('Category')) {
          setErrors((prev) => ({ ...prev, category_id: errorMessage }));
        } else if (errorMessage.includes('Loại mục tiêu') || errorMessage.includes('goal_type')) {
          setErrors((prev) => ({ ...prev, goal_type: errorMessage }));
        } else {
          // Hiển thị lỗi general ở đầu form
          setErrors((prev) => ({ ...prev, general: errorMessage }));
        }
      }
      // Xử lý lỗi 409 Conflict - mục tiêu đã tồn tại
      else if (status === 409) {
        const errorMessage = errorData?.message || 'Mục tiêu chi tiêu này đã tồn tại';
        setErrors((prev) => ({ ...prev, category_id: errorMessage }));
      }
      // Xử lý lỗi 401 - Unauthorized
      else if (status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // Xử lý lỗi 500 hoặc lỗi server khác
      else if (status >= 500 || !status) {
        showToast('Lỗi hệ thống, vui lòng thử lại sau.', 'error');
      }
      // Xử lý các lỗi khác
      else {
        const errorMessage = errorData?.message || 'Đã xảy ra lỗi khi tạo mục tiêu';
        setErrors((prev) => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tạo mục tiêu mới</h2>
          <p className="text-gray-600 mt-2">Điền thông tin mục tiêu của bạn</p>
        </div>

        {/* Hiển thị lỗi general ở đầu form */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleCreateGoal} className="space-y-6">
          {/* Loại mục tiêu */}
          <div>
            <label
              htmlFor="goal_type"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Loại mục tiêu <span className="text-red-500">*</span>
            </label>
            <select
              id="goal_type"
              name="goal_type"
              value={formData.goal_type}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 bg-white ${
                errors.goal_type ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value={GoalType.SAVING}>Tiết kiệm (Saving)</option>
              <option value={GoalType.EXPENSE_LIMIT}>Giới hạn chi tiêu (Expense)</option>
            </select>
            {errors.goal_type && (
              <p className="mt-1 text-sm text-red-600">{errors.goal_type}</p>
            )}
          </div>

          {/* Danh mục - CHỈ hiển thị khi goal_type là Expense_Limit */}
          {formData.goal_type === GoalType.EXPENSE_LIMIT && (
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                required={formData.goal_type === GoalType.EXPENSE_LIMIT}
                disabled={isLoading || isLoadingCategories}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white ${
                  errors.category_id ? 'border-red-300' : 'border-gray-300'
                } ${isLoading || isLoadingCategories ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Chọn danh mục</option>
                {isLoadingCategories ? (
                  <option>Đang tải danh sách danh mục...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))
                )}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>
          )}

          {/* Ngày bắt đầu */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 ${
                errors.start_date ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              required
              disabled={isLoading}
              min={formData.start_date}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 ${
                errors.end_date ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
          </div>

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
              placeholder="0.00"
            />
            {errors.target_amount && (
              <p className="mt-1 text-sm text-red-600">{errors.target_amount}</p>
            )}
          </div>

          {/* Số tiền đã đạt được (optional) */}
          <div>
            <label
              htmlFor="target_archived"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Số tiền đã đạt được
            </label>
            <input
              id="target_archived"
              name="target_archived"
              type="number"
              step="0.01"
              min="0"
              value={formData.target_archived || ''}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                errors.target_archived ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="0.00"
            />
            {errors.target_archived && (
              <p className="mt-1 text-sm text-red-600">{errors.target_archived}</p>
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
                'Tạo Mục tiêu'
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

