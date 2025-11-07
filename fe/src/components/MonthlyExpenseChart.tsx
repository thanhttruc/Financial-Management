import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getMonthlyExpenseSummary, type MonthlyExpenseSummary } from '../api/expenses';
import { Card } from './Card';
import { formatCurrency } from '../utils/formatters';

/**
 * Component hiển thị biểu đồ cột tổng chi tiêu theo tháng
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
export const MonthlyExpenseChart: React.FC = () => {
  const [chartData, setChartData] = useState<MonthlyExpenseSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMonthlyExpenseSummary();
        setChartData(data);
      } catch (err: any) {
        console.error('Error fetching monthly expense summary:', err);
        setError(
          err.response?.data?.message || 'Không thể lấy dữ liệu chi tiêu.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xác định tháng hiện tại
  const getCurrentMonth = (): string => {
    const now = new Date();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const currentMonth = getCurrentMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth(); // 0-11

  // Tạo mảng đầy đủ 12 tháng từ tháng 1 đến tháng 12 của năm hiện tại
  const getFullYearData = useMemo(() => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Tạo map từ dữ liệu API để dễ lookup
    const dataMap = new Map<string, number>();
    chartData.forEach((item) => {
      dataMap.set(item.month, item.totalExpense);
    });

    // Tạo mảng 12 tháng với dữ liệu từ API hoặc 0 nếu không có
    return monthNames.map((monthName, index) => {
      const monthKey = `${monthName} ${currentYear}`;
      const totalExpense = dataMap.get(monthKey) || 0;
      const isCurrentMonth = index === currentMonthIndex;

      return {
        month: monthName,
        monthFull: monthKey,
        totalExpense,
        isCurrentMonth,
      };
    });
  }, [chartData, currentYear, currentMonthIndex]);

  // Tìm dữ liệu tháng hiện tại
  const currentMonthData = useMemo(() => {
    return getFullYearData.find((item) => item.isCurrentMonth);
  }, [getFullYearData]);

  // Tính toán thống kê (chỉ tính các tháng có dữ liệu thực tế)
  const stats = useMemo(() => {
    const monthsWithData = getFullYearData.filter((item) => item.totalExpense > 0);
    
    if (monthsWithData.length === 0) {
      return { total: 0, average: 0, currentMonthTotal: 0 };
    }
    
    const total = getFullYearData.reduce((sum, item) => sum + item.totalExpense, 0);
    const average = total / monthsWithData.length; // Chỉ tính trung bình các tháng có dữ liệu
    const currentMonthTotal = currentMonthData?.totalExpense || 0;
    
    return { total, average, currentMonthTotal };
  }, [getFullYearData, currentMonthData]);

  // Custom tooltip với thiết kế đẹp hơn
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const currentYear = new Date().getFullYear();
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">
            {data.monthFull || `${data.month} ${currentYear}`}
          </p>
          <p className="text-gray-900 font-bold text-lg">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton với thiết kế đẹp hơn
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </Card>
          ))}
        </div>
        {/* Chart Skeleton */}
        <Card>
          <div className="w-full h-96 animate-pulse">
            <div className="h-full bg-gray-200 rounded-lg"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state với thiết kế đẹp hơn
  if (error) {
    return (
      <Card className="border-l-4 border-red-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 opacity-50 -z-10" />
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
    );
  }

  // Không cần empty state nữa vì luôn hiển thị 12 tháng (có thể là 0)

  // Chart display với thiết kế chuyên nghiệp
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expense Card */}
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>

        {/* Average Expense Card */}
        <Card className="border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Chi tiêu trung bình</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.average)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </Card>

        {/* Current Month Card */}
        <Card className="border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tháng này</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.currentMonthTotal)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Card */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tổng chi tiêu theo tháng</h3>
          <p className="text-sm text-gray-500">Biểu đồ thể hiện chi tiêu hàng tháng của bạn</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Tháng hiện tại ({currentMonth})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400"></div>
            <span className="text-sm text-gray-600">Các tháng khác</span>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getFullYearData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  }
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Bar
                dataKey="totalExpense"
                radius={[12, 12, 0, 0]}
              >
                {getFullYearData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrentMonth ? '#10b981' : '#9ca3af'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

