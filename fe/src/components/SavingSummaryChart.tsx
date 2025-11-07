import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getSavingSummary, type SavingSummaryResponse, type MonthlySavingData } from '../api/savings';
import { Card } from './Card';
import { formatCurrency } from '../utils/formatters';

/**
 * Component hiển thị biểu đồ đường kép so sánh tiết kiệm theo năm
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
export const SavingSummaryChart: React.FC = () => {
  const [chartData, setChartData] = useState<SavingSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Tạo danh sách năm để chọn (từ năm hiện tại trở về 5 năm trước)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, []);

  // Fetch data khi component mount hoặc selectedYear thay đổi
  useEffect(() => {
    const fetchSavingSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSavingSummary(selectedYear);
        setChartData(data);
      } catch (err: any) {
        console.error('Error fetching saving summary:', err);
        // Xử lý lỗi 500
        if (err.response?.status === 500) {
          setError('Không thể lấy dữ liệu tiết kiệm.');
        } else {
          setError(
            err.response?.data?.message || 'Không thể lấy dữ liệu tiết kiệm.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavingSummary();
  }, [selectedYear]);

  // Tiền xử lý dữ liệu: Đảm bảo trục X (tháng) được điền đầy đủ từ 01 đến 12
  const processedChartData = useMemo(() => {
    if (!chartData) return [];

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Tạo map từ dữ liệu API để dễ lookup
    const thisYearMap = new Map<string, number>();
    chartData.this_year.forEach((item) => {
      thisYearMap.set(item.month, item.saving);
    });

    const lastYearMap = new Map<string, number>();
    chartData.last_year.forEach((item) => {
      lastYearMap.set(item.month, item.saving);
    });

    // Tạo mảng 12 tháng với dữ liệu từ API hoặc 0 nếu không có
    return monthNames.map((monthName, index) => {
      const monthStr = String(index + 1).padStart(2, '0'); // "01", "02", ..., "12"
      const thisYearSaving = thisYearMap.get(monthStr) || 0;
      const lastYearSaving = lastYearMap.get(monthStr) || 0;

      return {
        month: monthName,
        monthNumber: monthStr,
        thisYear: Math.round(thisYearSaving * 100) / 100,
        lastYear: Math.round(lastYearSaving * 100) / 100,
      };
    });
  }, [chartData]);

  // Kiểm tra dữ liệu rỗng
  const isEmptyData = useMemo(() => {
    if (!chartData) return true;
    const hasThisYearData = chartData.this_year.some((item) => item.saving !== 0);
    const hasLastYearData = chartData.last_year.some((item) => item.saving !== 0);
    return !hasThisYearData && !hasLastYearData;
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide">
            {data.month} {selectedYear}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-gray-900 font-bold text-lg"
              style={{ color: entry.color }}
            >
              {entry.name === 'thisYear' ? 'Năm này' : 'Cùng kỳ năm trước'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="w-full h-96 animate-pulse">
          <div className="h-full bg-gray-200 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  // Error state (500 hoặc lỗi khác)
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

  // Empty data state
  if (isEmptyData) {
    return (
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tổng hợp tiết kiệm</h3>
            <p className="text-sm text-gray-500">So sánh tiết kiệm theo năm</p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-600 mb-2">
            Không có dữ liệu tiết kiệm để so sánh trong năm này.
          </p>
          <p className="text-sm text-gray-500">Vui lòng chọn năm khác hoặc thêm giao dịch.</p>
        </div>
      </Card>
    );
  }

  // Chart display
  return (
    <Card className="p-4 lg:p-6">
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2">Tổng hợp tiết kiệm</h3>
          <p className="text-xs lg:text-sm text-gray-500">So sánh tiết kiệm theo năm</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm lg:text-base"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-6 mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-blue-600"></div>
          <span className="text-xs lg:text-sm font-semibold text-gray-900">Năm này ({selectedYear})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-gray-400 border-2 border-dashed border-gray-500"></div>
          <span className="text-xs lg:text-sm text-gray-600">Cùng kỳ năm trước ({selectedYear - 1})</span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 lg:h-80 xl:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedChartData}
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => {
                if (value === 'thisYear') return `Năm này (${selectedYear})`;
                if (value === 'lastYear') return `Cùng kỳ năm trước (${selectedYear - 1})`;
                return value;
              }}
            />
            {/* Đường "This Year" - đậm, màu xanh đậm */}
            <Line
              type="monotone"
              dataKey="thisYear"
              name="thisYear"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {/* Đường "Last Year" - nét đứt, màu xám */}
            <Line
              type="monotone"
              dataKey="lastYear"
              name="lastYear"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#9ca3af', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

