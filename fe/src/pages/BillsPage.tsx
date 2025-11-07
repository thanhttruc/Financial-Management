import React from 'react';
import { UpcomingBillsView } from '../components/bills';

/**
 * Trang hiển thị danh sách hóa đơn sắp tới
 * Component này sẽ tự động gọi API GET /api/v1/bills khi mount
 */
export const BillsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <UpcomingBillsView />
      </div>
    </div>
  );
};

