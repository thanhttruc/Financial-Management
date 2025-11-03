import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { getMonthlyExpensesSummary, getExpenseBreakdown } from '../api/expenses';
import type { MonthlyExpense, ExpenseBreakdownItem } from '../api/expenses';

export const ExpensesPage: React.FC = () => {
  const [data, setData] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breakdownData, setBreakdownData] = useState<ExpenseBreakdownItem[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(true);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Backend sẽ lấy userId từ JWT token tự động
        // Gửi userId từ localStorage nếu có để tương thích ngược
        const userIdStr = localStorage.getItem('userId');
        const userId = userIdStr ? Number(userIdStr) : undefined;
        const res = await getMonthlyExpensesSummary(userId);
        setData(res.data || []);
      } catch (e: any) {
        console.error('Error fetching expenses:', e);
        const errorMsg = e.response?.data?.message || 'Unable to fetch expense data.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch breakdown data
  useEffect(() => {
    (async () => {
      try {
        const userIdStr = localStorage.getItem('userId');
        const userId = userIdStr ? Number(userIdStr) : undefined;
        // Get current month (YYYY-MM)
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const res = await getExpenseBreakdown(userId, currentMonth);
        setBreakdownData(res.data || []);
      } catch (e: any) {
        console.error('Error fetching breakdown:', e);
        // If 404, don't show error, just show empty state
        if (e.response?.status !== 404) {
          const errorMsg = e.response?.data?.message || 'Unable to fetch expense breakdown data.';
          setBreakdownError(errorMsg);
        }
      } finally {
        setBreakdownLoading(false);
      }
    })();
  }, []);

  const currentMonthIndex = new Date().getMonth(); // 0..11

  const maxValue = useMemo(() => {
    return data.reduce((acc, cur) => Math.max(acc, cur.totalExpense || 0), 0) || 1;
  }, [data]);

  // Tính toán thống kê
  const stats = useMemo(() => {
    const currentMonthExpense = data[currentMonthIndex]?.totalExpense || 0;
    const totalExpense = data.reduce((sum, item) => sum + (item.totalExpense || 0), 0);
    const averageExpense = data.length > 0 ? totalExpense / data.length : 0;
    const previousMonthExpense = currentMonthIndex > 0 ? data[currentMonthIndex - 1]?.totalExpense || 0 : 0;
    const changePercent = previousMonthExpense > 0 
      ? ((currentMonthExpense - previousMonthExpense) / previousMonthExpense * 100).toFixed(1)
      : '0.0';

    return {
      currentMonthExpense,
      totalExpense,
      averageExpense,
      changePercent: parseFloat(changePercent),
    };
  }, [data, currentMonthIndex]);

  // Format số tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format ngày (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Lấy icon cho category
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, { svg: JSX.Element; bgColor: string; iconColor: string }> = {
      Housing: {
        svg: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      Food: {
        svg: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        ),
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      Transportation: {
        svg: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        ),
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
      },
      Entertainment: {
        svg: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
      },
      Shopping: {
        svg: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
        bgColor: 'bg-pink-100',
        iconColor: 'text-pink-600',
      },
    };

    return iconMap[categoryName] || {
      svg: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Expenses</h1>
          <p className="text-gray-600">So sánh chi tiêu hàng tháng của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Chi tiêu tháng này</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.currentMonthExpense)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Trung bình/tháng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageExpense)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8m-8-8h8m-8 0V7m8 0l-8-8" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Thay đổi so với tháng trước</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${stats.changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent}%
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                {stats.changePercent >= 0 ? (
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8m-8-8h8m-8 0V7m8 0l-8-8" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8m-8 8h8m-8 0V9m8 0l8 8" />
                  </svg>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Card */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Expense Overview</h2>
            <p className="text-sm text-gray-600">Chi tiêu theo từng tháng trong năm</p>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p>Chưa có dữ liệu chi tiêu</p>
            </div>
          ) : (
            <div className="w-full">
              {/* Chart */}
              <div className="relative w-full overflow-x-auto pb-4">
                <div className="min-w-[600px]">
                  {/* Y-axis labels và grid */}
                  <div className="relative mb-4" style={{ height: '380px', paddingTop: '50px' }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between" style={{ paddingTop: '50px', paddingBottom: '40px' }}>
                      {[100, 75, 50, 25, 0].map((percent) => (
                        <div key={percent} className="relative">
                          <div className="absolute left-0 -top-3 text-xs text-gray-500" style={{ width: '40px' }}>
                            {formatCurrency((maxValue * percent) / 100)}
                          </div>
                          <div className="border-t border-gray-200" style={{ marginLeft: '50px' }}></div>
                        </div>
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end justify-around gap-2 px-4" style={{ paddingLeft: '50px', paddingRight: '20px', paddingTop: '50px', paddingBottom: '40px' }}>
                      {data.map((item, i) => {
                        const isCurrent = i === currentMonthIndex;
                        const heightPct = ((item.totalExpense || 0) / maxValue) * 100;
                        const barHeight = Math.max((heightPct / 100) * 280, 4); // Minimum 4px height

                        return (
                          <div
                            key={item.month}
                            className="flex flex-col items-center flex-1 group relative"
                            style={{ maxWidth: '60px' }}
                          >
                            {/* Value label on hover */}
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {formatCurrency(item.totalExpense)}
                              </div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>

                            {/* Bar */}
                            <div
                              className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer relative ${
                                isCurrent
                                  ? 'bg-gradient-to-t from-green-600 to-green-500 shadow-lg shadow-green-200 hover:shadow-green-300'
                                  : 'bg-gradient-to-t from-gray-400 to-gray-300 hover:from-gray-500 hover:to-gray-400'
                              }`}
                              style={{
                                height: `${barHeight}px`,
                                minHeight: '4px',
                              }}
                              title={`${item.month}: ${formatCurrency(item.totalExpense)}`}
                            >
                              {/* Value label on top of bar (always visible for current month) */}
                              {isCurrent && barHeight > 30 && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-green-600 whitespace-nowrap z-20">
                                  {formatCurrency(item.totalExpense)}
                                </div>
                              )}
                            </div>

                            {/* Month label */}
                            <span
                              className={`mt-2 text-xs font-medium transition-colors ${
                                isCurrent ? 'text-green-600 font-bold' : 'text-gray-600'
                              }`}
                            >
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-8 pt-6 border-t border-gray-200 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-t from-green-600 to-green-500"></div>
                  <span className="text-sm text-gray-700 font-medium">Tháng hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-t from-gray-400 to-gray-300"></div>
                  <span className="text-sm text-gray-700">Các tháng trước</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Expense Breakdown Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Expenses Breakdown</h2>
            <p className="text-gray-600">Chi tiết chi tiêu theo danh mục trong tháng</p>
          </div>

          {breakdownLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : breakdownError ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{breakdownError}</p>
            </div>
          ) : breakdownData.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p>Chưa có dữ liệu chi tiết chi tiêu cho tháng này</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breakdownData.map((item) => {
                const iconInfo = getCategoryIcon(item.category);
                const isIncrease = item.changePercent >= 0;

                return (
                  <Card key={item.category} className="hover:shadow-lg transition-shadow">
                    {/* Category Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${iconInfo.bgColor} rounded-lg p-2.5`}>
                          <div className={iconInfo.iconColor}>{iconInfo.svg}</div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.category}</h3>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Change Percent */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                      <span className="text-sm text-gray-600">So với tháng trước:</span>
                      <span
                        className={`text-sm font-semibold flex items-center gap-1 ${
                          isIncrease ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {isIncrease ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8m-8-8h8m-8 0V7m8 0l-8-8" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8m-8 8h8m-8 0V9m8 0l8 8" />
                          </svg>
                        )}
                        {Math.abs(item.changePercent)}%
                      </span>
                    </div>

                    {/* Sub-categories List */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Chi tiết
                      </p>
                      {item.subCategories.length === 0 ? (
                        <p className="text-sm text-gray-500">Không có dữ liệu</p>
                      ) : (
                        item.subCategories.map((subCat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{subCat.name}</p>
                              <p className="text-xs text-gray-500">{formatDate(subCat.date)}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 ml-4">
                              {formatCurrency(subCat.amount)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};