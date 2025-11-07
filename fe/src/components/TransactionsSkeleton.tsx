import React from 'react';
import { Card } from './Card';

/**
 * Skeleton Loader cho bảng giao dịch
 */
export const TransactionsSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      {/* Tab skeleton */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-300 rounded w-24"></div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </th>
              <th className="text-left py-4 px-4">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
              <th className="text-left py-4 px-4">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </th>
              <th className="text-left py-4 px-4">
                <div className="h-4 bg-gray-300 rounded w-28"></div>
              </th>
              <th className="text-left py-4 px-4">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-300 rounded w-28"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

