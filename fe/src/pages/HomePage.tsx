import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to Financial Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your income and expenses smartly and efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="💰 Total Income" className="border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">0 VNĐ</div>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </Card>

          <Card title="💸 Total Expenses" className="border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">0 VNĐ</div>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </Card>

          <Card title="📊 Balance" className="border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">0 VNĐ</div>
            <p className="text-sm text-gray-500 mt-2">Current</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="📋 Recent Transactions">
            <p className="text-gray-500 text-center py-8">
              No transactions yet
            </p>
            <Button variant="primary" className="w-full">
              Add New Transaction
            </Button>
          </Card>

          <Card title="🎯 Financial Goals">
            <p className="text-gray-500 text-center py-8">
              No goals yet
            </p>
            <Button variant="secondary" className="w-full">
              Create New Goal
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
