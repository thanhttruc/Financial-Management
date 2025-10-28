import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const CategoriesPage: React.FC = () => {
  const categories = [
    { name: '🍔 Ăn uống', color: 'bg-red-500' },
    { name: '🚗 Giao thông', color: 'bg-blue-500' },
    { name: '🛍️ Mua sắm', color: 'bg-purple-500' },
    { name: '🏠 Nhà ở', color: 'bg-green-500' },
    { name: '🏥 Y tế', color: 'bg-pink-500' },
    { name: '🎮 Giải trí', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Danh mục</h1>
          <Button variant="primary">+ Thêm danh mục</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                  {category.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{category.name}</p>
                  <p className="text-sm text-gray-500">0 giao dịch</p>
                </div>
                <Button variant="danger" size="sm">
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
