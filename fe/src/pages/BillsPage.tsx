import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { fetchUpcomingBills, createBill } from '../api/bills';
import type { BillItem } from '../api/bills';
import { Loading } from '../components/Loading';

/**
 * Trang hiển thị danh sách hóa đơn sắp tới - bố cục dạng bảng giống Figma
 */
export const BillsPage: React.FC = () => {
  const [bills, setBills] = useState<BillItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    itemDescription: '',
    logoUrl: '',
    dueDate: '',
    lastChargeDate: '',
    amount: '' as unknown as number | string,
  });

  useEffect(() => {
    fetchUpcomingBills()
      .then((data) => setBills(data))
      .catch(() => setError('Unable to load bills list'));
  }, []);

  const formatMonthDay = (isoDate?: string | null) => {
    if (!isoDate) return { month: '--', day: '--' };
    const d = new Date(isoDate);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }),
      day: d.getDate().toString().padStart(2, '0'),
    };
  };

  const formatHuman = (isoDate?: string | null) => {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '');
  };

  const sortedBills = useMemo(() => {
    return (bills ?? []).slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [bills]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!bills) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Header title */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Upcoming Bills</h1>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
              onClick={() => {
                setIsOpen(true);
                setSuccessMsg(null);
              }}
            >
              + Add New Bill
            </button>
          </div>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500">
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Logo</div>
          <div className="col-span-5">Item Description</div>
          <div className="col-span-2 text-right md:text-left">Last Charge</div>
          <div className="col-span-1 text-right">Amount</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {sortedBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-6xl mb-4">🧾</span>
              <p className="mt-2 text-gray-500 text-center">No upcoming bills.</p>
            </div>
          ) : (
            sortedBills.map((bill) => {
              const due = formatMonthDay(bill.dueDate);
              return (
                <div key={bill.billId} className="grid grid-cols-12 gap-4 px-6 py-5 items-center">
                  {/* Due date pill */}
                  <div className="col-span-12 md:col-span-2 order-1 md:order-1">
                    <div className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-gray-100 text-gray-700">
                      <span className="text-xs font-medium">{due.month}</span>
                      <span className="text-lg font-semibold">{due.day}</span>
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="col-span-12 md:col-span-2 order-3 md:order-2 flex md:block">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                        {bill.logoUrl ? (
                          <img src={bill.logoUrl} alt={bill.itemDescription} className="h-6 w-6 object-contain" />
                        ) : (
                          <span className="text-gray-400">🧾</span>
                        )}
                      </div>
                      <span className="md:hidden text-gray-700">Logo</span>
                    </div>
                  </div>

                  {/* Item Description */}
                  <div className="col-span-12 md:col-span-5 order-2 md:order-3">
                    <div className="text-gray-900 font-semibold">{bill.itemDescription}</div>
                    {/* <div className="text-xs text-gray-500 mt-1 max-w-prose">
                      For advanced security and more flexible controls, the Professional plan helps you scale design processes company-wide.
                    </div> */}
                  </div>

                  {/* Last charge */}
                  <div className="col-span-6 md:col-span-2 order-4 md:order-4 text-gray-600 text-sm md:text-base md:text-left text-right">
                    {formatHuman(bill.lastChargeDate)}
                  </div>

                  {/* Amount */}
                  <div className="col-span-6 md:col-span-1 order-5 md:order-5 flex md:block justify-end">
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 shadow-sm bg-white text-gray-900 font-semibold">
                      ${bill.amount.toFixed(0)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold">Create New Bill</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <form
              className="px-6 py-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setError(null);
                setSuccessMsg(null);
                try {
                  const payload = {
                    itemDescription: form.itemDescription.trim(),
                    logoUrl: form.logoUrl.trim() || null,
                    dueDate: form.dueDate,
                    lastChargeDate: form.lastChargeDate || null,
                    amount: typeof form.amount === 'string' ? parseFloat(form.amount) : (form.amount as number),
                  };
                  if (!payload.itemDescription || !payload.dueDate || !payload.amount || isNaN(payload.amount)) {
                    setError('Missing or invalid bill data');
                    setSaving(false);
                    return;
                  }
                  const res = await createBill(payload);
                  setSuccessMsg(res.message || 'Created');
                  setBills((prev) => (prev ? [res.data, ...prev] : [res.data]));
                  setIsOpen(false);
                  setForm({ itemDescription: '', logoUrl: '', dueDate: '', lastChargeDate: '', amount: '' as any });
                } catch (err) {
                  setError('Unable to create bill');
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Item Description</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={form.itemDescription}
                    onChange={(e) => setForm((s) => ({ ...s, itemDescription: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Logo URL</label>
                  <input
                    type="url"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={form.logoUrl}
                    onChange={(e) => setForm((s) => ({ ...s, logoUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      value={form.dueDate}
                      onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Last Charge Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      value={form.lastChargeDate}
                      onChange={(e) => setForm((s) => ({ ...s, lastChargeDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={form.amount as any}
                    onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="px-0 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700"
                  onClick={() => setIsOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow">{successMsg}</div>
      )}
    </div>
  );
};


