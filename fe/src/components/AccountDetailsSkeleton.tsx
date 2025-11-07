import React from 'react';
import { Card } from './Card';

/**
 * Skeleton Loader cho Account Details Page
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
export const AccountDetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-9 w-24 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-9 w-48 bg-gray-300 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Details Card Skeleton */}
          <div className="lg:col-span-1">
            <Card className="border-l-4 border-gray-300 animate-pulse">
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="mb-6 space-y-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-gray-300 rounded mr-3 mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-gray-300 rounded mr-3 mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 rounded w-24 mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-40"></div>
                  </div>
                </div>
              </div>

              {/* Balance Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="h-3 bg-gray-300 rounded w-12 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded w-36"></div>
              </div>
            </Card>
          </div>

          {/* Transactions Table Skeleton */}
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <div className="mb-6 flex items-center justify-between">
                <div className="h-6 bg-gray-300 rounded w-40"></div>
                <div className="h-9 bg-gray-300 rounded w-32"></div>
              </div>

              {/* Table skeleton */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <th key={i} className="text-left py-3 px-4">
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4, 5].map((j) => (
                          <td key={j} className="py-4 px-4">
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

