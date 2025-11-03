import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { getAccountDetail, deleteAccount, updateAccount, type AccountDetail, type UpdateAccountRequest } from '../api/accounts';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Lấy icon và màu cho từng loại tài khoản
 */
const getAccountTypeConfig = (accountType: string) => {
  const configs: Record<string, { icon: string; color: string; borderColor: string }> = {
    'Checking': { icon: '💳', color: 'bg-blue-100', borderColor: 'border-blue-500' },
    'Credit Card': { icon: '💳', color: 'bg-purple-100', borderColor: 'border-purple-500' },
    'Savings': { icon: '💰', color: 'bg-green-100', borderColor: 'border-green-500' },
    'Investment': { icon: '📈', color: 'bg-yellow-100', borderColor: 'border-yellow-500' },
    'Loan': { icon: '🏦', color: 'bg-red-100', borderColor: 'border-red-500' },
  };
  
  return configs[accountType] || { icon: '🏦', color: 'bg-gray-100', borderColor: 'border-gray-500' };
};

export const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const [editForm, setEditForm] = useState<UpdateAccountRequest>({
    bank_name: '',
    account_type: 'Checking',
    branch_name: '',
    account_number_full: '',
    balance: 0,
  });

  const accountId = id ? Number(id) : null;

  useEffect(() => {
    if (!accountId) {
      setError('ID tài khoản không hợp lệ');
      setLoading(false);
      return;
    }

    fetchAccountDetail(accountId, limit, 0, false);
  }, [accountId]);

  const fetchAccountDetail = async (id: number, limitParam: number, offsetParam: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await getAccountDetail(id, limitParam, offsetParam);
      if (response.success) {
        if (append && accountDetail) {
          // Append transactions to existing list
          setAccountDetail({
            ...accountDetail,
            recent_transactions: [
              ...accountDetail.recent_transactions,
              ...response.data.recent_transactions,
            ],
            has_more: response.data.has_more,
          });
        } else {
          setAccountDetail(response.data);
        }
        setOffset(offsetParam);
      } else {
        setError(response.message || 'Không thể tải chi tiết tài khoản');
      }
    } catch (err: any) {
      console.error('Error fetching account detail:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết tài khoản');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!accountId || !accountDetail) return;
    const newOffset = offset + limit;
    fetchAccountDetail(accountId, limit, newOffset, true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!accountId) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteAccount(accountId);
      // Navigate back to accounts page after successful deletion
      navigate('/accounts');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Không thể xóa tài khoản');
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setError(null);
  };

  const handleEdit = () => {
    if (!accountDetail) return;
    
    // Khởi tạo form với dữ liệu hiện tại
    setEditForm({
      bank_name: accountDetail.bank_name || '',
      account_type: (accountDetail.account_type as any) || 'Checking',
      branch_name: accountDetail.branch_name || '',
      account_number_full: accountDetail.account_number_full || '',
      balance: accountDetail.balance || 0,
    });
    
    setIsEditModalOpen(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setError(null);
    setEditForm({
      bank_name: '',
      account_type: 'Checking',
      branch_name: '',
      account_number_full: '',
      balance: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'balance' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setSaving(true);
    setError(null);

    try {
      // Validate
      if (!editForm.bank_name?.trim() || !editForm.account_number_full?.trim()) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        setSaving(false);
        return;
      }

      if (editForm.balance !== undefined && editForm.balance < 0) {
        setError('Số dư phải lớn hơn hoặc bằng 0');
        setSaving(false);
        return;
      }

      const response = await updateAccount(accountId, editForm);
      
      if (response.success) {
        // Refresh chi tiết tài khoản
        await fetchAccountDetail(accountId, limit, 0, false);
        
        // Đóng modal
        setIsEditModalOpen(false);
        setEditForm({
          bank_name: '',
          account_type: 'Checking',
          branch_name: '',
          account_number_full: '',
          balance: 0,
        });
      } else {
        setError(response.message || 'Không thể cập nhật tài khoản');
      }
    } catch (err: any) {
      console.error('Error updating account:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật tài khoản');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <Loading text="Đang tải chi tiết tài khoản..." />
        </div>
      </div>
    );
  }

  if (error && !accountDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            {error}
          </div>
          <Button variant="secondary" onClick={() => navigate('/accounts')}>
            Quay lại danh sách tài khoản
          </Button>
        </div>
      </div>
    );
  }

  if (!accountDetail) {
    return null;
  }

  const config = getAccountTypeConfig(accountDetail.account_type);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header với nút quay lại */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate('/accounts')} className="mb-4">
            ← Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Chi tiết tài khoản</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* Thông tin tài khoản */}
        <Card className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center text-3xl`}>
                  {config.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{accountDetail.bank_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{accountDetail.account_type}</p>
                  {accountDetail.branch_name && (
                    <p className="text-xs text-gray-500 mt-1">📍 {accountDetail.branch_name}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Số tài khoản:</span>
                <span className="text-sm font-mono text-gray-800">{accountDetail.account_number_full}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số dư hiện tại:</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(accountDetail.balance)}</span>
              </div>
            </div>
          </div>

          {/* Buttons Chỉnh sửa và Xóa */}
          <div className="mt-6 flex space-x-3">
            <Button variant="primary" onClick={handleEdit} className="flex-1">
              ✏️ Chỉnh sửa
            </Button>
            <Button variant="danger" onClick={handleDeleteClick} className="flex-1">
              🗑️ Xóa
            </Button>
          </div>
        </Card>

        {/* Danh sách giao dịch */}
        <Card>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Giao dịch gần đây</h4>
          {accountDetail.recent_transactions && accountDetail.recent_transactions.length > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                {accountDetail.recent_transactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.date)}</p>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {accountDetail.has_more && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Đang tải...' : 'Tải thêm'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-500">Chưa có giao dịch nào</p>
            </div>
          )}
        </Card>
      </div>

      {/* Modal chỉnh sửa tài khoản */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Chỉnh sửa tài khoản {accountDetail?.bank_name}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngân hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={editForm.bank_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ví dụ: TPBank, Vietcombank..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại tài khoản <span className="text-red-500">*</span>
                </label>
                <select
                  name="account_type"
                  value={editForm.account_type}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Checking">Checking</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Savings">Savings</option>
                  <option value="Investment">Investment</option>
                  <option value="Loan">Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chi nhánh
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={editForm.branch_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ví dụ: Quận 1, Quận 3..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tài khoản đầy đủ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="account_number_full"
                  value={editForm.account_number_full}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ví dụ: 9704221122334455667"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hệ thống sẽ tự động cập nhật 4 số cuối
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số dư hiện tại (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="balance"
                  value={editForm.balance}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa tài khoản */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">⚠️ Xác nhận xóa tài khoản</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5">
              {error && (
                <div className="p-3 rounded bg-red-50 text-red-700 text-sm mb-4">{error}</div>
              )}
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa tài khoản{' '}
                <span className="font-semibold text-gray-900">
                  {accountDetail.bank_name}
                </span>{' '}
                không? Tất cả giao dịch liên quan đến tài khoản này cũng sẽ bị ẩn khỏi hệ thống.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Dừng lại
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

