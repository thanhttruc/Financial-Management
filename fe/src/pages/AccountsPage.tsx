import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { getAccounts, createAccount, deleteAccount, type Account, type CreateAccountRequest } from '../api/accounts';
import { formatCurrency } from '../utils/formatters';

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

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<CreateAccountRequest>({
    bank_name: '',
    account_type: 'Checking',
    branch_name: '',
    account_number_full: '',
    balance: 0,
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAccounts();
        setAccounts(response.accounts || []);
      } catch (err: any) {
        console.error('Error fetching accounts:', err);
        setError(err.response?.data?.message || 'Unable to load accounts list');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate
      if (!form.bank_name.trim() || !form.account_number_full.trim()) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      if (form.balance < 0) {
        setError('Balance must be greater than or equal to 0');
        setSaving(false);
        return;
      }

      const response = await createAccount(form);
      
      if (response.success) {
        // Refresh danh sách tài khoản
        const updatedAccounts = await getAccounts();
        setAccounts(updatedAccounts.accounts || []);
        
        // Reset form và đóng modal
        setForm({
          bank_name: '',
          account_type: 'Checking',
          branch_name: '',
          account_number_full: '',
          balance: 0,
        });
        setIsModalOpen(false);
      } else {
        setError(response.message || 'Unable to create account');
      }
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.response?.data?.message || 'Unable to create new account');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'balance' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteAccount(accountToDelete.id);
      
      // Refresh danh sách tài khoản
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts.accounts || []);
      
      // Đóng modal và reset
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Unable to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
    setError(null);
  };

  const handleViewDetail = (account: Account) => {
    navigate(`/accounts/${account.id}`);
  };

  const formatAccountDisplay = (account: Account) => {
    const bankName = account.bank_name || 'N/A';
    const accountNumber = account.account_number || '';
    return `${bankName}${accountNumber ? ' - ' + accountNumber : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <Loading text="Loading accounts list..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">My Accounts</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Add Account
          </Button>
        </div>

        {accounts.length === 0 ? (
          <Card className="border-l-4 border-gray-300 bg-gray-50">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏦</div>
              <p className="text-gray-500 text-lg mb-4">No accounts yet</p>
              <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                + Add Account
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const config = getAccountTypeConfig(account.account_type);
              return (
                <Card key={account.id} className={`border-l-4 ${config.borderColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${config.color} rounded-full flex items-center justify-center text-2xl`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{account.bank_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{account.account_type}</p>
                        {account.account_number && (
                          <p className="text-sm text-gray-600 mt-1 font-mono">
                            {account.account_number}
                          </p>
                        )}
                        {account.branch_name && (
                          <p className="text-xs text-gray-400 mt-1">{account.branch_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-4">
                    {formatCurrency(account.balance)}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewDetail(account)}
                    >
                      Details
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteClick(account)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal thêm tài khoản */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Add New Account</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                  setForm({
                    bank_name: '',
                    account_type: 'Checking',
                    branch_name: '',
                    account_number_full: '',
                    balance: 0,
                  });
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={form.bank_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., TPBank, Vietcombank..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="account_type"
                  value={form.account_type}
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
                  Branch
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={form.branch_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., District 4, District 1..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="account_number_full"
                  value={form.account_number_full}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 9704221122334455667"
                />
                <p className="text-xs text-gray-500 mt-1">
                  System will automatically save the last 4 digits for display
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Balance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="balance"
                  value={form.balance}
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setForm({
                      bank_name: '',
                      account_type: 'Checking',
                      branch_name: '',
                      account_number_full: '',
                      balance: 0,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa tài khoản */}
      {isDeleteModalOpen && accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">⚠️ Confirm Delete Account</h2>
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
                Are you sure you want to delete account{' '}
                <span className="font-semibold text-gray-900">
                  {formatAccountDisplay(accountToDelete)}
                </span>{' '}
                ? All related transactions will also be hidden from the system.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
