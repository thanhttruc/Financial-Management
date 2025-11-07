import React from 'react';
import { MonthlyExpenseChart } from '../components/MonthlyExpenseChart';
import { ExpenseBreakdown } from '../components/ExpenseBreakdown';

/**
 * Trang hiển thị biểu đồ tổng chi tiêu theo tháng và breakdown chi tiêu theo danh mục
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 * Component này sẽ tự động gọi API GET /api/v1/expenses/summary và /api/v1/expenses/breakdown khi mount
 */
export const ExpensesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiêu</h1>
          <p className="text-gray-600">Theo dõi và phân tích chi tiêu hàng tháng của bạn</p>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <MonthlyExpenseChart />
        </div>

        {/* Breakdown Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Phân tích chi tiêu theo danh mục</h2>
            <p className="text-gray-600">Xem chi tiết chi tiêu được phân loại theo từng danh mục</p>
          </div>
          <ExpenseBreakdown />
        </div>
      </div>
    </div>
  );
};

