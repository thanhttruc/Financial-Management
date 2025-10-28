import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const GoalsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Mục tiêu tài chính</h1>
          <Button variant="primary">+ Thêm mục tiêu</Button>
        </div>

        <Card className="border-l-4 border-blue-500">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  🏠 Mua nhà
                </h3>
                <span className="text-sm font-medium text-gray-600">
                  50% hoàn thành
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: '50%' }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Đã tiết kiệm: 1,000,000 VNĐ</span>
                <span>Mục tiêu: 2,000,000 VNĐ</span>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Chưa có mục tiêu nào</p>
              <Button variant="secondary">+ Tạo mục tiêu mới</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
