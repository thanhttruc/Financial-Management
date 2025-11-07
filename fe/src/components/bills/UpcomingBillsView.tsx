import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../Card';
import { UpcomingBillsSkeleton } from './UpcomingBillsSkeleton';
import { getUpcomingBills, type Bill } from '../../api/bills';
import { formatCurrency } from '../../utils/formatters';

/**
 * Component hiển thị danh sách hóa đơn sắp tới
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 * Sử dụng useEffect để fetch data khi component mount
 * Authorization header được tự động thêm bởi axiosInstance interceptor
 */
export const UpcomingBillsView: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetch danh sách hóa đơn sắp tới khi component mount
     * Authorization header được tự động thêm từ localStorage.accessToken
     * thông qua axiosInstance interceptor
     */
    const fetchBills = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Gọi API GET /api/v1/bills
        // Authorization header được tự động thêm từ localStorage.getItem('accessToken')
        const data = await getUpcomingBills();

        // Lưu dữ liệu vào state
        setBills(data);
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

        // Xử lý lỗi Server (500): Hiển thị thông báo lỗi ở vị trí nổi bật
        if (status === 500) {
          setError('Failed to fetch bills');
          console.error('Error fetching bills:', err);
          return;
        }

        // Xử lý các lỗi khác
        const errorMessage = err.response?.data?.message || 'Không thể tải danh sách hóa đơn';
        setError(errorMessage);
        console.error('Error fetching bills:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [navigate]);

  /**
   * Format ngày hiển thị trong badge (ví dụ: "May 15", "Jun 16")
   */
  const formatDateForBadge = (date: string): string => {
    const dateObj = new Date(date);
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    return `${month} ${day}`;
  };

  /**
   * Format ngày cho Last Charge (ví dụ: "14 May, 2022")
   */
  const formatLastChargeDate = (date: string): string => {
    const dateObj = new Date(date);
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const day = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  // Trạng thái Loading: Hiển thị Skeleton Loader
  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Bills</h1>
        </div>
        <UpcomingBillsSkeleton />
      </div>
    );
  }

  // Xử lý lỗi Server (500): Hiển thị thông báo lỗi ở vị trí nổi bật
  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Bills</h1>
        </div>
        <Card className="border-l-4 border-red-500 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-50 -z-10`} />
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-red-600 mb-2">{error}</p>
            <p className="text-sm text-gray-600">Vui lòng thử lại sau.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Xử lý Dữ liệu Rỗng: Hiển thị thông báo khi danh sách bills rỗng
  if (bills.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Bills</h1>
        </div>
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50 -z-10`} />
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Bạn không có hóa đơn sắp tới nào.
            </p>
            <p className="text-sm text-gray-500">Các hóa đơn sắp đến sẽ được hiển thị ở đây.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Hiển thị danh sách hóa đơn theo thiết kế Figma
  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Bills</h1>
      </div>

      {/* Table Layout - Thiết kế theo Figma */}
      <Card className="p-0 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:flex gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="w-24 flex-shrink-0 font-semibold text-sm text-gray-700">Due Date</div>
          <div className="w-16 flex-shrink-0 font-semibold text-sm text-gray-700">Logo</div>
          <div className="flex-1 min-w-0 font-semibold text-sm text-gray-700">Item Description</div>
          <div className="w-32 flex-shrink-0 font-semibold text-sm text-gray-700">Last Charge</div>
          <div className="w-24 flex-shrink-0 font-semibold text-sm text-gray-700">Amount</div>
        </div>

        {/* Bills List */}
        <div className="divide-y divide-gray-200">
          {bills.map((bill) => (
            <div
              key={bill.billId}
              className="flex flex-col md:flex-row gap-4 px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer items-center"
            >
              {/* Due Date - Badge */}
              <div className="w-full md:w-24 flex-shrink-0 flex items-center">
                <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg whitespace-nowrap">
                  {formatDateForBadge(bill.dueDate)}
                </span>
              </div>

              {/* Logo */}
              <div className="w-full md:w-16 flex-shrink-0 flex items-center">
                {bill.logoUrl ? (
                  <img
                    src={bill.logoUrl}
                    alt={bill.itemDescription}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xl">📄</span>
                  </div>
                )}
              </div>

              {/* Item Description */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                  {bill.itemDescription}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  For advanced security and more flexible controls, the Professional plan helps you scale design processes company-wide.
                </p>
              </div>

              {/* Last Charge */}
              <div className="w-full md:w-32 flex-shrink-0 flex items-center text-sm text-gray-600">
                {bill.lastChargeDate ? (
                  <span className="whitespace-nowrap">{formatLastChargeDate(bill.lastChargeDate)}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>

              {/* Amount - Badge */}
              <div className="w-full md:w-24 flex-shrink-0 flex items-center justify-end md:justify-start">
                <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg whitespace-nowrap">
                  {formatCurrency(bill.amount).replace(/\s/g, '')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

