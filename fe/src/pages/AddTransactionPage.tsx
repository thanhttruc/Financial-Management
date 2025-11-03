import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { createTransaction, type CreateTransactionRequest, type TransactionType } from '../api/transactions';

export const AddTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateTransactionRequest>({
    accountId: 1,
    transactionDate: new Date().toISOString(),
    type: 'Expense',
    itemDescription: '',
    shopName: '',
    amount: 0,
    paymentMethod: '',
    status: 'Complete',
    categoryId: undefined,
    subCategoryName: '',
    subCategoryAmount: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'amount' || name === 'accountId' || name === 'categoryId' || name === 'subCategoryAmount'
        ? (value === '' ? undefined : Number(value))
        : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target; // yyyy-mm-dd
    // Tạo date ở UTC midnight để tránh timezone conversion
    // value = "2024-11-01" -> "2024-11-01T00:00:00.000Z"
    const iso = `${value}T00:00:00.000Z`;
    setForm((prev) => ({ ...prev, transactionDate: iso }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateTransactionRequest = {
        accountId: form.accountId,
        transactionDate: form.transactionDate,
        type: form.type as TransactionType,
        itemDescription: form.itemDescription,
        shopName: form.shopName || undefined,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod || undefined,
        status: form.status,
        // Chỉ gửi expense detail fields nếu type = Expense
        ...(form.type === 'Expense' && {
          categoryId: form.categoryId,
          subCategoryName: form.subCategoryName || undefined,
          subCategoryAmount: form.subCategoryAmount,
        }),
      };
      const res = await createTransaction(payload);
      if (res.success) {
        alert('Thêm giao dịch thành công.');
        navigate('/transactions');
      } else {
        setError(res.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Thêm giao dịch</h1>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên giao dịch</label>
              <input
                type="text"
                name="itemDescription"
                value={form.itemDescription}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ví dụ: Movie Ticket"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục / Shop</label>
              <input
                type="text"
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ví dụ: Inox"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại giao dịch</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giao dịch</label>
                <input
                  type="date"
                  value={new Date(form.transactionDate).toISOString().slice(0, 10)}
                  onChange={handleDateChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Cash / Credit Card ..."
                />
              </div>
            </div>
            {/* Expense Detail Fields - chỉ hiển thị khi type = Expense */}
            {form.type === 'Expense' && (
              <div className="border-t border-gray-200 pt-5 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Chi tiết chi tiêu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="categoryId"
                      min={1}
                      value={form.categoryId || ''}
                      onChange={handleChange}
                      required={form.type === 'Expense'}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="1 (Housing), 2 (Food), ..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ví dụ: 1=Housing, 2=Food, 3=Transportation, 4=Entertainment, 5=Shopping, 6=Others
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-category Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="subCategoryAmount"
                      value={form.subCategoryAmount || ''}
                      onChange={handleChange}
                      required={form.type === 'Expense'}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-category Name (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    name="subCategoryName"
                    value={form.subCategoryName || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ví dụ: House Rent, Grocery, Restaurant Bill..."
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                <input
                  type="number"
                  name="accountId"
                  min={1}
                  value={form.accountId}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Complete">Complete</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/transactions')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="bg-[#009688] hover:opacity-90"
              >
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddTransactionPage;


