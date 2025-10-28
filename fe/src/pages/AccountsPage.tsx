import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const AccountsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Tài khoản</h1>
          <Button variant="primary">+ Thêm tài khoản</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  💳
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Tài khoản ngân hàng</p>
                  <p className="text-sm text-gray-500">Vietcombank</p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">0 VNĐ</div>
            <div className="mt-4 flex space-x-2">
              <Button variant="secondary" size="sm" className="flex-1">
                Chi tiết
              </Button>
              <Button variant="danger" size="sm" className="flex-1">
                Xóa
              </Button>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500 bg-gray-50">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Chưa có tài khoản nào</p>
              <Button variant="secondary">+ Thêm tài khoản</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
