import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccountDetails, AccountType } from '../api/accounts';
import type { AccountDetails as AccountDetailsType } from '../api/accounts';
import { Card } from './Card';
import { Button } from './Button';
import { AccountDetailsSkeleton } from './AccountDetailsSkeleton';
import { EditAccountForm } from './EditAccountForm';
import { Toast, useToast } from './Toast';

/**
 * Format số tiền thành định dạng VNĐ
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format ngày từ YYYY-MM-DD thành DD/MM/YYYY
 */
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Format số tài khoản: hiển thị tất cả trừ 4 số cuối
 * Ví dụ: 9704221234567890123 -> 970422123456789****
 */
const formatAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) {
    return accountNumber;
  }
  // Hiển thị tất cả trừ 4 số cuối, thay bằng ****
  const visiblePart = accountNumber.slice(0, -4);
  return `${visiblePart}****`;
};

/**
 * Lấy icon, gradient và màu sắc theo loại tài khoản
 */
const getAccountTypeConfig = (accountType: AccountType) => {
  switch (accountType) {
    case AccountType.CHECKING:
      return {
        icon: '💳',
        gradient: 'from-blue-500 to-blue-600',
        bgGradient: 'from-blue-50 to-blue-100',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800',
      };
    case AccountType.CREDIT_CARD:
      return {
        icon: '💳',
        gradient: 'from-purple-500 to-purple-600',
        bgGradient: 'from-purple-50 to-purple-100',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-700',
        badgeColor: 'bg-purple-100 text-purple-800',
      };
    case AccountType.SAVINGS:
      return {
        icon: '💰',
        gradient: 'from-green-500 to-green-600',
        bgGradient: 'from-green-50 to-green-100',
        borderColor: 'border-green-500',
        textColor: 'text-green-700',
        badgeColor: 'bg-green-100 text-green-800',
      };
    case AccountType.INVESTMENT:
      return {
        icon: '📈',
        gradient: 'from-yellow-500 to-yellow-600',
        bgGradient: 'from-yellow-50 to-yellow-100',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800',
      };
    case AccountType.LOAN:
      return {
        icon: '📋',
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100',
        borderColor: 'border-red-500',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800',
      };
    default:
      return {
        icon: '🏦',
        gradient: 'from-gray-500 to-gray-600',
        bgGradient: 'from-gray-50 to-gray-100',
        borderColor: 'border-gray-500',
        textColor: 'text-gray-700',
        badgeColor: 'bg-gray-100 text-gray-800',
      };
  }
};

/**
 * Component hiển thị chi tiết tài khoản và lịch sử giao dịch
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
export const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [accountDetails, setAccountDetails] = useState<AccountDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Fetch chi tiết tài khoản khi component mount
     */
    const fetchAccountDetails = async () => {
      if (!id) {
        setError('ID tài khoản không hợp lệ');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const accountId = parseInt(id, 10);
        if (isNaN(accountId)) {
          throw new Error('ID tài khoản không hợp lệ');
        }

        const data = await getAccountDetails(accountId);
        setAccountDetails(data);
      } catch (err: any) {
        const status = err.response?.status;
        const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
        const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.message?.includes('ERR_INSUFFICIENT_RESOURCES');
        
        // Xử lý lỗi Network Error
        if (isNetworkError) {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend server đã được khởi động chưa\n- Kết nối mạng của bạn\n- CORS settings của backend');
          console.error('Network error fetching account details:', err);
          return;
        }
        
        // Xử lý lỗi timeout
        if (isTimeout) {
          setError('Kết nối quá lâu. Vui lòng kiểm tra kết nối mạng và thử lại.');
          console.error('Timeout fetching account details:', err);
          return;
        }
        
        if (status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        // Xử lý lỗi 403 hoặc 404: redirect về /accounts và hiển thị Toast
        if (status === 403 || status === 404) {
          showToast('Truy cập bị từ chối hoặc Tài khoản không tồn tại.', 'error');
          // Delay redirect để Toast có thể hiển thị trước khi component unmount
          setTimeout(() => {
            navigate('/accounts');
          }, 2000);
          return;
        }

        // Xử lý các lỗi khác
        const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết tài khoản';
        setError(errorMessage);
        
        console.error('Error fetching account details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, [id, navigate]);

  /**
   * Hàm fetch lại chi tiết tài khoản sau khi cập nhật
   */
  const refetchAccountDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const accountId = parseInt(id, 10);
      if (isNaN(accountId)) {
        throw new Error('ID tài khoản không hợp lệ');
      }

      const data = await getAccountDetails(accountId);
      setAccountDetails(data);
      setIsEditing(false);
    } catch (err: any) {
      const status = err.response?.status;
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.message?.includes('ERR_INSUFFICIENT_RESOURCES');
      
      if (isNetworkError) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend server đã được khởi động chưa\n- Kết nối mạng của bạn\n- CORS settings của backend');
      } else if (isTimeout) {
        setError('Kết nối quá lâu. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } else if (status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (status === 403 || status === 404) {
        showToast('Truy cập bị từ chối hoặc Tài khoản không tồn tại.', 'error');
        setTimeout(() => {
          navigate('/accounts');
        }, 2000);
      } else {
        const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết tài khoản';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state - Hiển thị Skeleton Loader
  if (isLoading) {
    return (
      <>
        <AccountDetailsSkeleton />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </>
    );
  }

  // Error state
  if (error || !accountDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <Card className="border-l-4 border-red-500">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đã xảy ra lỗi</h3>
              <p className="text-gray-600 mb-6 whitespace-pre-line">{error || 'Không thể tải chi tiết tài khoản'}</p>
              <div className="flex justify-center space-x-3">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    // Trigger re-fetch by changing dependency
                    const accountId = id ? parseInt(id, 10) : null;
                    if (accountId && !isNaN(accountId)) {
                      getAccountDetails(accountId)
                        .then((data) => {
                          setAccountDetails(data);
                          setIsLoading(false);
                        })
                        .catch((err: any) => {
                          const status = err.response?.status;
                          const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
                          const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.message?.includes('ERR_INSUFFICIENT_RESOURCES');
                          
                          if (isNetworkError) {
                            setError('Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend server đã được khởi động chưa\n- Kết nối mạng của bạn\n- CORS settings của backend');
                          } else if (isTimeout) {
                            setError('Kết nối quá lâu. Vui lòng kiểm tra kết nối mạng và thử lại.');
                          } else if (status === 401) {
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('user');
                            navigate('/login');
                          } else if (status === 403 || status === 404) {
                            showToast('Truy cập bị từ chối hoặc Tài khoản không tồn tại.', 'error');
                            setTimeout(() => {
                              navigate('/accounts');
                            }, 2000);
                          } else {
                            const errorMessage = err.response?.data?.message || 'Không thể tải chi tiết tài khoản';
                            setError(errorMessage);
                          }
                          setIsLoading(false);
                        });
                    }
                  }}
                >
                  Thử lại
                </Button>
                <Button variant="secondary" onClick={() => navigate('/accounts')}>
                  Quay lại danh sách tài khoản
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Nếu đang ở chế độ chỉnh sửa, hiển thị form
  if (isEditing && accountDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <EditAccountForm
            accountDetails={accountDetails}
            onSuccess={refetchAccountDetails}
            onCancel={() => setIsEditing(false)}
          />
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={hideToast}
            />
          )}
        </div>
      </div>
    );
  }

  const config = getAccountTypeConfig(accountDetails.account_type);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header với nút quay lại */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/accounts')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Chi tiết tài khoản</h1>
          </div>
        </div>

        {/* Account Details Section - Full width */}
        <Card className={`border-l-4 ${config.borderColor} relative overflow-hidden mb-6`}>
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 -z-10`} />
          
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-6">
              {/* Icon with gradient background */}
              <div className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                {config.icon}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 text-2xl mb-2">
                  {accountDetails.bank_name || 'Ngân hàng'}
                </h2>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.badgeColor}`}>
                  {accountDetails.account_type}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Balance */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Số dư</p>
              <p className={`text-3xl font-bold ${config.textColor} tracking-tight`}>
                {formatCurrency(accountDetails.balance)}
              </p>
            </div>

            {/* Branch Name */}
            {accountDetails.branch_name && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Chi nhánh</p>
                <p className="text-lg font-medium text-gray-800">{accountDetails.branch_name}</p>
              </div>
            )}
            
            {/* Account Number */}
            {accountDetails.account_number_full && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Số tài khoản</p>
                <p className="text-lg font-mono text-gray-800 font-semibold tracking-wider">
                  {formatAccountNumber(accountDetails.account_number_full)}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <Button 
              variant="primary" 
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa chi tiết
            </Button>
            <Button 
              variant="danger"
              onClick={() => {
                // TODO: Implement delete functionality
                if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
                  showToast('Tính năng xóa sẽ được triển khai sớm', 'info');
                }
              }}
            >
              Xóa
            </Button>
          </div>
        </Card>

        {/* Transactions History Section - Full width below */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Lịch sử giao dịch</h3>
            <Button variant="primary" size="sm">
              + Thêm giao dịch
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số tiền
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accountDetails.recent_transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="text-gray-500 text-sm">
                        Không có giao dịch gần đây nào.
                      </div>
                    </td>
                  </tr>
                ) : (
                  accountDetails.recent_transactions.map((transaction, index) => {
                    const isExpense = transaction.amount < 0;
                    const amountColor = isExpense ? 'text-red-600' : 'text-green-600';
                    const typeBadge = isExpense 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800';
                    const typeLabel = isExpense ? 'Chi tiêu' : 'Thu nhập';

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(transaction.date)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-800">{transaction.description}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${typeBadge}`}>
                            {typeLabel}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></span>
                            Hoàn thành
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className={`text-sm font-bold ${amountColor}`}>
                            {isExpense ? '-' : '+'}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

