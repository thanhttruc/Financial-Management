import React from 'react';
import { Card } from './Card';

/**
 * Skeleton Loader cho Account Card
 */
const AccountCardSkeleton: React.FC = () => {
  return (
    <Card className="border-l-4 border-gray-300 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gray-300 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-4 bg-gray-300 rounded w-40"></div>
      </div>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="h-3 bg-gray-300 rounded w-12 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-32"></div>
      </div>

      <div className="flex space-x-2">
        <div className="flex-1 h-8 bg-gray-300 rounded"></div>
        <div className="flex-1 h-8 bg-gray-300 rounded"></div>
      </div>
    </Card>
  );
};

/**
 * Skeleton Loader cho danh sách tài khoản
 */
export const AccountsListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </div>
  );
};

