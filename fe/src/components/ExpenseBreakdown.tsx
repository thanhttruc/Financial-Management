import React, { useState, useEffect } from 'react';
import { getExpenseBreakdown, type ExpenseBreakdownItem, type ExpenseItemDetail } from '../api/expenses';
import { Card } from './Card';
import { formatCurrency } from '../utils/formatters';

/**
 * Skeleton Loader cho Expense Breakdown Card
 */
const BreakdownCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse bg-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
          <div>
            <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-7 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-28"></div>
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </Card>
  );
};

/**
 * Lấy icon cho category
 */
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    'Housing': '🏠',
    'Food': '🍴',
    'Transportation': '🚗',
    'Entertainment': '🎬',
    'Shopping': '🛍️',
    'Others': '📦',
  };
  return iconMap[categoryName] || '📦';
};

/**
 * Format date từ YYYY-MM-DD sang "DD MMM YYYY" (ví dụ: "17 May 2023")
 */
const formatItemDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Component hiển thị breakdown chi tiêu theo danh mục dạng Grid Card
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
export const ExpenseBreakdown: React.FC = () => {
  const [breakdownData, setBreakdownData] = useState<ExpenseBreakdownItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Format tháng từ YYYY-MM sang định dạng hiển thị
   */
  const formatMonthDisplay = (month: string): string => {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    const monthIndex = parseInt(monthNum, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  /**
   * Lấy tháng hiện tại theo format YYYY-MM
   */
  const getCurrentMonthString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  /**
   * Gọi API để lấy breakdown chi tiêu
   */
  const fetchBreakdown = async (month?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const monthToFetch = month || getCurrentMonthString();
      setCurrentMonth(monthToFetch);
      const data = await getExpenseBreakdown(monthToFetch);
      setBreakdownData(data);
    } catch (err: any) {
      console.error('Error fetching expense breakdown:', err);
      const errorMessage = err.response?.data?.message || 'Không thể lấy dữ liệu breakdown chi tiêu.';
      
      // Kiểm tra nếu là lỗi "Không có dữ liệu chi tiêu cho tháng này"
      if (errorMessage.includes('Không có dữ liệu chi tiêu cho tháng này')) {
        setError('Không có dữ liệu chi tiết chi tiêu cho tháng đã chọn.');
      } else {
        setError(errorMessage);
      }
      setBreakdownData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, []);

  /**
   * Hiển thị tỷ lệ thay đổi với mũi tên màu theo Figma
   * Red cho tăng, Green cho giảm
   */
  const renderChangePercent = (changePercent: number) => {
    const isPositive = changePercent > 0;
    const isNegative = changePercent < 0;
    const arrowColor = isPositive ? 'text-red-500' : isNegative ? 'text-green-500' : 'text-gray-500';
    const arrowIcon = isPositive ? '↑' : isNegative ? '↓' : '→';
    const sign = changePercent > 0 ? '+' : '';

    return (
      <div className="flex flex-col items-end">
        <div className={`flex items-center space-x-1 ${arrowColor} mb-1`}>
          <span className="text-sm font-semibold">{arrowIcon}</span>
          <span className="text-sm font-semibold">
            {sign}{Math.abs(changePercent).toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-gray-500">Compare to last month</p>
      </div>
    );
  };

  /**
   * Hiển thị danh sách items với amount và date theo Figma
   */
  const renderItems = (items: ExpenseItemDetail[]) => {
    if (!items || items.length === 0) {
      return (
        <p className="text-sm text-gray-400 italic">Không có chi tiết giao dịch</p>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start justify-between">
            {/* Left: Description */}
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-gray-800">
                {item.itemDescription}
              </p>
            </div>
            {/* Right: Amount and Date */}
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                {formatCurrency(item.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {formatItemDate(item.transactionDate)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Hiển thị Skeleton Loader khi đang tải
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Expenses Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BreakdownCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi hoặc dữ liệu rỗng
  if (error || breakdownData.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Expenses Breakdown</h2>
        <Card className="bg-gray-50">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {error || 'Không có dữ liệu chi tiết chi tiêu cho tháng đã chọn.'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Hiển thị Grid Card với dữ liệu breakdown theo Figma design
  return (
    <div>
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 mb-6">Expenses Breakdown</h2>

      {/* Month Display */}
      {currentMonth && (
        <div className="mb-6 text-sm text-gray-600">
          Đang hiển thị: <span className="font-semibold text-gray-900">{formatMonthDisplay(currentMonth)}</span>
        </div>
      )}

      {/* Grid Cards - 2 rows x 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {breakdownData.map((item) => (
          <Card 
            key={item.categoryId} 
            className="bg-gray-50 hover:shadow-lg transition-shadow duration-200 border border-gray-200"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
              {/* Left: Icon + Category Name + Total */}
              <div className="flex items-start space-x-3 flex-1">
                {/* Icon */}
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{getCategoryIcon(item.categoryName)}</span>
                </div>
                {/* Category Name + Total */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-800 mb-1 truncate">
                    {item.categoryName}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              </div>
              {/* Right: Change Percent */}
              <div className="flex-shrink-0 ml-4">
                {renderChangePercent(item.changePercent)}
              </div>
            </div>

            {/* Items Section */}
            <div className="pt-4 border-t border-gray-200">
              {renderItems(item.items)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
