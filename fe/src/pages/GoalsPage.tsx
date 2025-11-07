import React, { useState } from 'react';
import { Button } from '../components/Button';
import { GoalsView } from '../components/GoalsView';
import { NewGoalForm } from '../components/NewGoalForm';

/**
 * Trang hiển thị mục tiêu tài chính
 * Bao gồm: Savings Goal Card và Expense Goals Grid
 */
export const GoalsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Xử lý khi tạo mục tiêu thành công
   */
  const handleGoalCreated = () => {
    setShowForm(false);
    // Force refresh GoalsView by changing key
    setRefreshKey((prev) => prev + 1);
  };

  /**
   * Xử lý khi hủy form
   */
  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Mục tiêu tài chính</h1>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Thêm mục tiêu
          </Button>
        </div>

        {showForm ? (
          <NewGoalForm
            onSuccess={handleGoalCreated}
            onCancel={handleCancelForm}
          />
        ) : (
          <GoalsView key={refreshKey} />
        )}
      </div>
    </div>
  );
};
