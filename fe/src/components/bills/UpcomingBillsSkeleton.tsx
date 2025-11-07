import React from 'react';
import { Card } from '../Card';

/**
 * Skeleton Loader cho Bill Row trong table
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
const BillRowSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 px-6 py-5 animate-pulse border-b border-gray-200 items-center">
      {/* Due Date */}
      <div className="w-full md:w-24 flex-shrink-0 flex items-center">
        <div className="h-8 bg-gray-300 rounded-lg w-20"></div>
      </div>
      {/* Logo */}
      <div className="w-full md:w-16 flex-shrink-0 flex items-center">
        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
      </div>
      {/* Item Description */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </div>
      {/* Last Charge */}
      <div className="w-full md:w-32 flex-shrink-0 flex items-center">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
      {/* Amount */}
      <div className="w-full md:w-24 flex-shrink-0 flex items-center justify-end md:justify-start">
        <div className="h-8 bg-gray-300 rounded-lg w-20"></div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader cho danh sách hóa đơn
 */
export const UpcomingBillsSkeleton: React.FC = () => {
  return (
    <Card className="p-0 overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="hidden md:flex gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 animate-pulse">
        <div className="w-24 flex-shrink-0 h-4 bg-gray-300 rounded"></div>
        <div className="w-16 flex-shrink-0 h-4 bg-gray-300 rounded"></div>
        <div className="flex-1 min-w-0 h-4 bg-gray-300 rounded"></div>
        <div className="w-32 flex-shrink-0 h-4 bg-gray-300 rounded"></div>
        <div className="w-24 flex-shrink-0 h-4 bg-gray-300 rounded"></div>
      </div>
      
      {/* Bills List Skeleton */}
      <div className="divide-y divide-gray-200">
        {[1, 2, 3, 4].map((i) => (
          <BillRowSkeleton key={i} />
        ))}
      </div>
    </Card>
  );
};

