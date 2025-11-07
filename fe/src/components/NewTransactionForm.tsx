import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTransaction, TransactionType } from '../api/transactions';
import type { CreateTransactionRequest } from '../api/transactions';
import { getAccounts } from '../api/accounts';
import type { Account } from '../api/accounts';
import { getCategories } from '../api/categories';
import type { Category } from '../api/categories';
import { Button } from './Button';
import { Card } from './Card';
import { Toast, useToast } from './Toast';

/**
 * Component form thêm giao dịch mới
 * Form chứa các Input cho Tên giao dịch, Danh mục, Số tiền, Loại giao dịch và Ngày giao dịch
 */
export const NewTransactionForm: React.FC = () => {
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // State cho các trường input
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    accountId: 0,
    type: TransactionType.EXPENSE,
    itemDescription: '',
    amount: 0,
    transactionDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    categoryId: undefined,
    shopName: '',
    paymentMethod: '',
  });

  // State cho danh sách tài khoản
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  // State cho danh sách categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // State cho loading khi submit
  const [isLoading, setIsLoading] = useState(false);

  // State cho errors theo từng trường
  const [errors, setErrors] = useState<{
    accountId?: string;
    type?: string;
    itemDescription?: string;
    amount?: string;
    transactionDate?: string;
    categoryId?: string;
    shopName?: string;
    paymentMethod?: string;
    general?: string;
  }>({});

  /**
   * Load danh sách tài khoản và categories khi component mount
   */
  useEffect(() => {
    const fetchData = async () => {
      // Load accounts
      try {
        setIsLoadingAccounts(true);
        const accountsList = await getAccounts();
        setAccounts(accountsList);
        // Tự động chọn tài khoản đầu tiên nếu có
        if (accountsList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            accountId: accountsList[0].accountId,
          }));
        }
      } catch (error: any) {
        console.error('Error fetching accounts:', error);
        showToast('Không thể tải danh sách tài khoản', 'error');
      } finally {
        setIsLoadingAccounts(false);
      }

      // Load categories
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

    fetchData();
  }, []);

  /**
   * Hàm xử lý thay đổi input
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Xử lý riêng cho amount để chuyển sang number
    if (name === 'amount') {
      const numValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (name === 'accountId') {
      // Xử lý accountId để chuyển sang number
      const numValue = value ? parseInt(value, 10) : 0;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (name === 'type') {
      // Khi thay đổi type, reset categoryId nếu chuyển sang Revenue
      setFormData((prev) => ({
        ...prev,
        [name]: value as TransactionType,
        categoryId: value === TransactionType.EXPENSE ? prev.categoryId : undefined,
      }));
    } else if (name === 'categoryId') {
      // Xử lý categoryId để chuyển sang number
      const numValue = value ? parseInt(value, 10) : undefined;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
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
   * Hàm xử lý hủy bỏ - điều hướng về trang transactions
   */
  const handleCancel = () => {
    navigate('/transactions');
  };

  /**
   * Hàm xử lý lưu giao dịch - gửi request POST để tạo giao dịch mới
   */
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate client-side cơ bản
    const newErrors: typeof errors = {};
    if (!formData.accountId || formData.accountId === 0) {
      newErrors.accountId = 'Vui lòng chọn tài khoản';
    }
    if (!formData.itemDescription.trim()) {
      newErrors.itemDescription = 'Tên giao dịch không được để trống';
    }
    // Validation số tiền: phải là số dương và lớn hơn 0
    if (!formData.amount || formData.amount <= 0 || isNaN(formData.amount)) {
      newErrors.amount = 'Số tiền phải là số dương và lớn hơn 0';
    }
    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Ngày giao dịch không được để trống';
    }
    // Validation categoryId: bắt buộc khi type = Expense
    if (formData.type === TransactionType.EXPENSE && (!formData.categoryId || formData.categoryId === 0)) {
      newErrors.categoryId = 'Danh mục không được để trống khi loại giao dịch là Chi tiêu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // Đảm bảo accountId là number trước khi gửi
      const transactionData: CreateTransactionRequest = {
        ...formData,
        accountId: typeof formData.accountId === 'string' ? parseInt(formData.accountId, 10) : formData.accountId,
        categoryId: formData.categoryId ? (typeof formData.categoryId === 'string' ? parseInt(formData.categoryId, 10) : formData.categoryId) : undefined,
      };

      // Gọi API tạo giao dịch
      await createTransaction(transactionData);

      // Thành công: hiển thị Toast và điều hướng về trang transactions
      showToast('Thêm giao dịch thành công.', 'success');
      
      // Điều hướng về trang transactions sau 1 giây
      setTimeout(() => {
        navigate('/transactions');
      }, 1000);
    } catch (err: any) {
      const status = err.response?.status;
      const errorData = err.response?.data;

      // Xử lý lỗi 400/422 BadRequest - hiển thị lỗi validation
      if (status === 400 || status === 422) {
        const errorMessage = errorData?.message || 'Dữ liệu không hợp lệ';
        
        // Parse error message để hiển thị đúng trường
        if (errorMessage.includes('Account ID') || errorMessage.includes('accountId')) {
          setErrors((prev) => ({ ...prev, accountId: errorMessage }));
        } else if (errorMessage.includes('Tên giao dịch') || errorMessage.includes('itemDescription')) {
          setErrors((prev) => ({ ...prev, itemDescription: errorMessage }));
        } else if (errorMessage.includes('Số tiền') || errorMessage.includes('amount')) {
          setErrors((prev) => ({ ...prev, amount: errorMessage }));
        } else if (errorMessage.includes('Ngày giao dịch') || errorMessage.includes('transactionDate')) {
          setErrors((prev) => ({ ...prev, transactionDate: errorMessage }));
        } else if (errorMessage.includes('Loại giao dịch') || errorMessage.includes('type')) {
          setErrors((prev) => ({ ...prev, type: errorMessage }));
        } else {
          // Hiển thị lỗi general ở đầu form
          setErrors((prev) => ({ ...prev, general: errorMessage }));
        }
      }
      // Xử lý lỗi 401 - Unauthorized
      else if (status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
      // Xử lý lỗi 500 hoặc lỗi server khác
      else if (status >= 500 || !status) {
        showToast('Lỗi hệ thống, vui lòng thử lại sau.', 'error');
      }
      // Xử lý các lỗi khác
      else {
        const errorMessage = errorData?.message || 'Đã xảy ra lỗi khi tạo giao dịch';
        setErrors((prev) => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format hiển thị tài khoản: "Tên ngân hàng - Số tài khoản"
   */
  const formatAccountDisplay = (account: Account): string => {
    const bankName = account.bankName || 'Ngân hàng';
    const accountNumber = account.accountNumberFull || account.accountNumberLast4 || '';
    return `${bankName} - ${accountNumber}`;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Thêm giao dịch mới</h2>
              <p className="text-gray-600 mt-2">Điền thông tin giao dịch của bạn</p>
            </div>

            {/* Hiển thị lỗi general ở đầu form */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSaveTransaction} className="space-y-6">
              {/* Chọn Tài khoản */}
              <div>
                <label
                  htmlFor="accountId"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tài khoản <span className="text-red-500">*</span>
                </label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isLoadingAccounts}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white ${
                    errors.accountId ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading || isLoadingAccounts ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  {isLoadingAccounts ? (
                    <option>Đang tải danh sách tài khoản...</option>
                  ) : accounts.length === 0 ? (
                    <option value="0">Không có tài khoản nào</option>
                  ) : (
                    accounts.map((account) => (
                      <option key={account.accountId} value={account.accountId}>
                        {formatAccountDisplay(account)}
                      </option>
                    ))
                  )}
                </select>
                {errors.accountId && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
                )}
              </div>

              {/* Loại giao dịch */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Loại giao dịch <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value={TransactionType.EXPENSE}>Chi tiêu (Expense)</option>
                  <option value={TransactionType.REVENUE}>Thu nhập (Revenue)</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Tên giao dịch */}
              <div>
                <label
                  htmlFor="itemDescription"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tên giao dịch <span className="text-red-500">*</span>
                </label>
                <input
                  id="itemDescription"
                  name="itemDescription"
                  type="text"
                  value={formData.itemDescription}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.itemDescription ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Ví dụ: Mua đồ ăn trưa"
                />
                {errors.itemDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.itemDescription}</p>
                )}
              </div>

              {/* Danh mục - Chỉ hiển thị khi type = Expense */}
              {formData.type === TransactionType.EXPENSE && (
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleChange}
                    required={formData.type === TransactionType.EXPENSE}
                    disabled={isLoading || isLoadingCategories}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 ${
                      errors.categoryId ? 'border-red-300' : 'border-gray-300'
                    } ${isLoading || isLoadingCategories ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                  )}
                </div>
              )}

              {/* Tên cửa hàng (Shop Name) - Optional */}
              <div>
                <label
                  htmlFor="shopName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tên cửa hàng
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  value={formData.shopName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.shopName ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Ví dụ: Siêu thị Coopmart, Cửa hàng tiện lợi"
                />
                {errors.shopName && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopName}</p>
                )}
              </div>

              {/* Số tiền */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Số tiền <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Ngày giao dịch */}
              <div>
                <label
                  htmlFor="transactionDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Ngày giao dịch <span className="text-red-500">*</span>
                </label>
                <input
                  id="transactionDate"
                  name="transactionDate"
                  type="date"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 ${
                    errors.transactionDate ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.transactionDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.transactionDate}</p>
                )}
              </div>

              {/* Phương thức thanh toán (Optional) */}
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phương thức thanh toán
                </label>
                <input
                  id="paymentMethod"
                  name="paymentMethod"
                  type="text"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.paymentMethod ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Ví dụ: Tiền mặt, Thẻ tín dụng"
                />
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || isLoadingAccounts || isLoadingCategories || accounts.length === 0 || (formData.type === TransactionType.EXPENSE && categories.length === 0)}
                  className="relative"
                  style={{ backgroundColor: '#009688' }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isLoadingAccounts && accounts.length > 0) {
                      e.currentTarget.style.backgroundColor = '#008577';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && !isLoadingAccounts && accounts.length > 0) {
                      e.currentTarget.style.backgroundColor = '#009688';
                    }
                  }}
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
          </Card>
        </div>

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

