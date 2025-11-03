import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { getTransactions } from '../api/transactions';
import type { Transaction, TransactionFilterType, TransactionType } from '../api/transactions';
import { formatCurrency } from '../utils/formatters';
import { Loading } from '../components/Loading';

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  // Lấy userId từ localStorage (đã lưu khi đăng nhập)
  // Backend sẽ ưu tiên lấy từ JWT token, nên không bắt buộc gửi userId trong query param
  const userIdStr = localStorage.getItem('userId');
  const userId = userIdStr ? Number(userIdStr) : undefined;
  const [activeTab, setActiveTab] = useState<TransactionFilterType>('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  /**
   * Lấy danh sách giao dịch
   */
  const fetchTransactions = async (type: TransactionFilterType, currentOffset: number = 0, append: boolean = false) => {
    setLoading(true);
    try {
      // Backend sẽ lấy userId từ JWT token tự động
      // Gửi userId từ localStorage nếu có để tương thích ngược (không bắt buộc)
      const response = await getTransactions(type, limit, currentOffset, userId);
      if (append) {
        setTransactions((prev) => [...prev, ...response.data]);
      } else {
        setTransactions(response.data);
      }
      setHasMore(response.hasMore);
      setOffset(currentOffset);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý khi chuyển tab
   */
  const handleTabChange = (tab: TransactionFilterType) => {
    setActiveTab(tab);
    setOffset(0);
    fetchTransactions(tab, 0, false);
  };

  /**
   * Xử lý Load More
   */
  const handleLoadMore = () => {
    const newOffset = offset + limit;
    fetchTransactions(activeTab, newOffset, true);
  };

  /**
   * Lấy icon dựa trên type
   */
  const getTransactionIcon = (type: TransactionType): string => {
    if (type === 'Revenue') {
      return '💰';
    }
    return '🛒';
  };

  /**
   * Format date từ ISO string
   */
  const formatTransactionDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Load dữ liệu khi component mount và khi activeTab thay đổi
  useEffect(() => {
    fetchTransactions(activeTab, 0, false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <Button variant="primary" onClick={() => navigate('/transactions/new')}>+ Add Transaction</Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('All')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'All'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTabChange('Revenue')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'Revenue'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => handleTabChange('Expense')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'Expense'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        <Card>
          {loading && transactions.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions yet. Start adding new transactions!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Shop Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Payment Method</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.transactionId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              transaction.type === 'Revenue'
                                ? 'bg-green-100'
                                : 'bg-red-100'
                            }`}
                          >
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{transaction.itemDescription}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{transaction.shopName || '-'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{formatTransactionDate(transaction.transactionDate)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{transaction.paymentMethod || '-'}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p
                          className={`font-bold ${
                            transaction.type === 'Revenue' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'Revenue' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
