import React, { useState } from 'react';
import { Button } from '../components/Button';
import { AccountsList } from '../components/AccountsList';
import { NewAccountForm } from '../components/NewAccountForm';

export const AccountsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Hàm xử lý khi tạo tài khoản thành công
   * Đóng form và refresh danh sách accounts
   */
  const handleAccountCreated = () => {
    setShowForm(false);
    // Trigger refresh bằng cách thay đổi key
    setRefreshKey((prev) => prev + 1);
  };

  /**
   * Hàm xử lý khi hủy form
   */
  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Tài khoản</h1>
          {!showForm && (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              + Thêm tài khoản
            </Button>
          )}
        </div>

        {/* Hiển thị form thêm tài khoản hoặc danh sách */}
        {showForm ? (
          <div className="mb-8">
            <NewAccountForm
              onSuccess={handleAccountCreated}
              onCancel={handleCancelForm}
            />
          </div>
        ) : (
          <AccountsList key={refreshKey} />
        )}
      </div>
    </div>
  );
};
