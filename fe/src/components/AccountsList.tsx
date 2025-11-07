import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccounts, deleteAccount, AccountType } from '../api/accounts';
import type { Account } from '../api/accounts';
import { AccountsListSkeleton } from './AccountsListSkeleton';
import { Card } from './Card';
import { Button } from './Button';
import { DeleteAccountModal } from './DeleteAccountModal';
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
 * Format số tài khoản: hiển thị tất cả trừ 4 số cuối
 * Ví dụ: 9704221234567890123 -> 970422123456789****
 */
const formatAccountNumber = (accountNumber: string | null): string => {
  if (!accountNumber || accountNumber.length < 4) {
    return accountNumber || '';
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

interface AccountCardProps {
  account: Account;
  onDelete: (account: Account) => void;
}

/**
 * Component hiển thị card cho một tài khoản
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
const AccountCard: React.FC<AccountCardProps> = ({ account, onDelete }) => {
  const navigate = useNavigate();
  const config = getAccountTypeConfig(account.accountType);

  return (
    <Card className={`border-l-4 ${config.borderColor} relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 -z-10`} />
      
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Icon with gradient background */}
          <div className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {account.bankName || 'Ngân hàng'}
            </h3>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${config.badgeColor}`}>
              {account.accountType}
            </span>
          </div>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="mb-6 space-y-3">
        {account.branchName && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{account.branchName}</span>
          </div>
        )}
        {account.accountNumberFull && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-mono text-gray-800 font-semibold tracking-wider">
              {formatAccountNumber(account.accountNumberFull)}
            </span>
          </div>
        )}
      </div>

      {/* Balance Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Số dư</p>
        <p className={`text-3xl font-bold ${config.textColor} tracking-tight`}>
          {formatCurrency(account.balance)}
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex space-x-2">
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 hover:shadow-md transition-shadow"
          onClick={() => navigate(`/accounts/${account.accountId}`)}
        >
          Chi tiết
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          className="flex-1 hover:shadow-md transition-shadow"
          onClick={() => onDelete(account)}
        >
          Xóa
        </Button>
      </div>
    </Card>
  );
};

/**
 * Component hiển thị danh sách tài khoản
 * Sử dụng useEffect để fetch data khi component mount
 * Authorization header được tự động thêm bởi axiosInstance interceptor
 */
export const AccountsList: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State cho Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Toast hook
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    /**
     * Fetch danh sách tài khoản khi component mount
     * Authorization header được tự động thêm từ localStorage.accessToken
     * thông qua axiosInstance interceptor
     */
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gọi API GET /api/v1/accounts
        // Authorization header được tự động thêm từ localStorage.getItem('accessToken')
        const data = await getAccounts();
        
        // Lưu dữ liệu vào state
        setAccounts(data);
      } catch (err: any) {
        const status = err.response?.status;
        
        // Xử lý lỗi 401 Unauthorized: Chuyển hướng về trang đăng nhập
        if (status === 401) {
          // Xóa token và user data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          // Chuyển hướng về trang đăng nhập
          navigate('/login');
          return;
        }
        
        // Xử lý các lỗi khác
        const errorMessage = err.response?.data?.message || 'Không thể tải danh sách tài khoản';
        setError(errorMessage);
        console.error('Error fetching accounts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [navigate]); // Thêm navigate vào dependency array

  /**
   * Format tên tài khoản để hiển thị trong modal (Ví dụ: Vietcombank - ****0123)
   */
  const getAccountDisplayName = (account: Account): string => {
    const bankName = account.bankName || 'Ngân hàng';
    const accountLast4 = account.accountNumberLast4 || '****';
    return `${bankName} - ****${accountLast4}`;
  };

  /**
   * Mở modal xác nhận xóa tài khoản
   */
  const handleOpenDeleteModal = (account: Account) => {
    setSelectedAccount(account);
    setDeleteModalOpen(true);
  };

  /**
   * Đóng modal xác nhận xóa
   */
  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setSelectedAccount(null);
    }
  };

  /**
   * Xử lý xác nhận xóa tài khoản
   * Gọi API DELETE /api/v1/accounts/:id
   */
  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;

    try {
      setIsDeleting(true);
      
      // Gọi API DELETE /api/v1/accounts/:id
      // Authorization header được tự động thêm từ localStorage.getItem('accessToken')
      // thông qua axiosInstance interceptor
      await deleteAccount(selectedAccount.accountId);

      // Xóa tài khoản khỏi danh sách hiển thị
      setAccounts((prevAccounts) =>
        prevAccounts.filter((acc) => acc.accountId !== selectedAccount.accountId)
      );

      // Hiển thị Toast thông báo thành công
      showToast('Xóa tài khoản thành công', 'success');

      // Đóng modal
      setDeleteModalOpen(false);
      setSelectedAccount(null);
    } catch (err: any) {
      const status = err.response?.status;
      
      // Xử lý lỗi 401 Unauthorized: Chuyển hướng về trang đăng nhập
      if (status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      // Xử lý lỗi 404/403: Hiển thị Toast thông báo lỗi
      if (status === 404 || status === 403) {
        const errorMessage =
          err.response?.data?.message ||
          'Account not found or not owned by current user';
        showToast(errorMessage, 'error');
      } else {
        // Xử lý các lỗi khác
        const errorMessage =
          err.response?.data?.message || 'Không thể xóa tài khoản';
        showToast(errorMessage, 'error');
      }
      
      console.error('Error deleting account:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state: Hiển thị Skeleton Loader
  if (isLoading) {
    return <AccountsListSkeleton />;
  }

  // Error state (không phải 401 vì đã xử lý redirect ở trên)
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state: API thành công nhưng danh sách rỗng
  if (accounts.length === 0) {
    return (
      <Card className="border-l-4 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có tài khoản nào</h3>
          <p className="text-gray-600 mb-6">Bạn chưa có tài khoản nào được liên kết.</p>
          <Button variant="secondary" className="shadow-md hover:shadow-lg transition-shadow">
            + Thêm tài khoản
          </Button>
        </div>
      </Card>
    );
  }

  // Render accounts grid
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        accountName={selectedAccount ? getAccountDisplayName(selectedAccount) : ''}
        isLoading={isDeleting}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <AccountCard
            key={account.accountId}
            account={account}
            onDelete={handleOpenDeleteModal}
          />
        ))}
      </div>
    </>
  );
};
