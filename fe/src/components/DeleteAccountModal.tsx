import React from 'react';
import { Button } from './Button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  accountName: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

/**
 * Component Modal xác nhận xóa tài khoản
 * Thiết kế theo phong cách Figma Finebank Financial Management Dashboard
 */
export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  accountName,
  isLoading = false,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            Xác nhận xóa tài khoản
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa tài khoản{' '}
            <span className="font-semibold text-gray-900">{accountName}</span> không?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Cảnh báo:</p>
                <p>
                  Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến tài khoản này
                  (bao gồm giao dịch và chi tiết chi tiêu) sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex space-x-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Dừng lại
          </Button>
          <Button
            variant="danger"
            onClick={onConfirmDelete}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </div>
      </div>
    </div>
  );
};

