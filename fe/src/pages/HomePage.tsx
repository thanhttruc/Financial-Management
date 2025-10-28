import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Chào mừng đến với Quản lý Tài chính
          </h1>
          <p className="text-gray-600 text-lg">
            Quản lý thu chi một cách thông minh và hiệu quả
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="💰 Tổng thu nhập" className="border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">0 VNĐ</div>
            <p className="text-sm text-gray-500 mt-2">Tháng này</p>
          </Card>

          <Card title="💸 Tổng chi tiêu" className="border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">0 VNĐ</div>
            <p className="text-sm text-gray-500 mt-2">Tháng này</p>
          </Card>

          <Card title="📊 Số dư" className="border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">0 VNĐ</div>
            <p className="text-sm text-gray-500 mt-2">Hiện tại</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="📋 Giao dịch gần đây">
            <p className="text-gray-500 text-center py-8">
              Chưa có giao dịch nào
            </p>
            <Button variant="primary" className="w-full">
              Thêm giao dịch mới
            </Button>
          </Card>

          <Card title="🎯 Mục tiêu tài chính">
            <p className="text-gray-500 text-center py-8">
              Chưa có mục tiêu nào
            </p>
            <Button variant="secondary" className="w-full">
              Tạo mục tiêu mới
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
