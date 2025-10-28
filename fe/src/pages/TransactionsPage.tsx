import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const TransactionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Giao dịch</h1>
          <Button variant="primary">+ Thêm giao dịch</Button>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  💰
                </div>
                <div>
                  <p className="font-medium text-gray-800">Thu nhập</p>
                  <p className="text-sm text-gray-500">Mô tả giao dịch</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">+1,000,000 VNĐ</p>
                <p className="text-sm text-gray-500">01/01/2024</p>
              </div>
            </div>

            <p className="text-gray-500 text-center py-8">
              Chưa có giao dịch nào. Bắt đầu thêm giao dịch mới!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
