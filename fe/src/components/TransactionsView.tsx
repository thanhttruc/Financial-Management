import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { TransactionsSkeleton } from './TransactionsSkeleton';
import { Toast, useToast } from './Toast';
import {
  getTransactions,
  type Transaction,
  TransactionFilterType,
  TransactionType,
} from '../api/transactions';
import { formatCurrency, formatDateShort } from '../utils/formatters';

/**
 * Component hiển thị danh sách giao dịch với tabs lọc và phân trang
 */
export const TransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentType, setCurrentType] = useState<TransactionFilterType>(
    TransactionFilterType.ALL
  );
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const { toast, showToast, hideToast } = useToast();

  const limit = 10;

  /**
   * Hàm gọi API để lấy danh sách giao dịch
   */
  const fetchTransactions = async (
    type: TransactionFilterType,
    offsetValue: number,
    append: boolean = false
  ) => {
    try {
      setIsLoading(true);

      const response = await getTransactions({
        type: type === TransactionFilterType.ALL ? undefined : type,
        limit,
        offset: offsetValue,
      });

      if (append) {
        // Nối dữ liệu mới vào mảng hiện có
        setTransactions((prev) => [...prev, ...response.data]);
      } else {
        // Thay thế dữ liệu hiện có
        setTransactions(response.data);
      }

      setTotal(response.total);
      setHasMore(response.hasMore);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      
      // Xử lý lỗi API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Có lỗi xảy ra khi tải danh sách giao dịch';
      
      showToast(errorMessage, 'error');

      // Reset trạng thái khi có lỗi
      if (!append) {
        setTransactions([]);
        setHasMore(false);
        setTotal(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * useEffect để gọi fetchTransactions khi component mount
   */
  useEffect(() => {
    fetchTransactions(TransactionFilterType.ALL, 0, false);
  }, []);

  /**
   * Hàm xử lý khi người dùng nhấn vào Tab
   */
  const handleTabClick = (type: TransactionFilterType) => {
    if (type === currentType) return;

    // Reset offset về 0 và cập nhật currentType
    setCurrentType(type);
    setOffset(0);
    
    // Gọi lại fetchTransactions để tải dữ liệu mới
    fetchTransactions(type, 0, false);
  };

  /**
   * Hàm xử lý khi người dùng nhấn nút Load More
   */
  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    
    // Gọi fetchTransactions với offset mới và append=true
    fetchTransactions(currentType, newOffset, true);
  };

  /**
   * Format số tiền với màu sắc theo loại giao dịch
   */
  const formatAmount = (amount: number, type: TransactionType) => {
    const formatted = formatCurrency(Math.abs(amount));
    const isRevenue = type === TransactionType.REVENUE;
    
    return (
      <span className={isRevenue ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
        {isRevenue ? '+' : '-'}{formatted}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <Card>
        {/* Tab lọc */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-4">
          {[
            { value: TransactionFilterType.ALL, label: 'All' },
            { value: TransactionFilterType.REVENUE, label: 'Revenue' },
            { value: TransactionFilterType.EXPENSE, label: 'Expenses' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentType === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hiển thị skeleton loader khi đang tải */}
        {isLoading && transactions.length === 0 && <TransactionsSkeleton />}

        {/* Bảng dữ liệu giao dịch */}
        {!isLoading || transactions.length > 0 ? (
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Chưa có giao dịch nào. Bắt đầu thêm giao dịch mới!
                </p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        Items
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        Shop Name
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        Payment Method
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.transactionId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-800">
                            {transaction.itemDescription}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {transaction.shopName || '-'}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDateShort(transaction.transactionDate)}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {transaction.paymentMethod || '-'}
                        </td>
                        <td className="py-4 px-4">
                          {formatAmount(
                            Number(transaction.amount),
                            transaction.type
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Nút Load More */}
                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="primary"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Đang tải...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  );
};

