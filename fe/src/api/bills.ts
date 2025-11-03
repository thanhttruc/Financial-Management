import { axiosInstance } from './axiosInstance';

export type BillItem = {
  billId: number;
  userId: number;
  itemDescription: string;
  logoUrl: string | null;
  dueDate: string; // YYYY-MM-DD
  lastChargeDate: string | null; // YYYY-MM-DD
  amount: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

/**
 * Lấy danh sách hóa đơn sắp tới
 */
export async function fetchUpcomingBills(): Promise<BillItem[]> {
  const res = await axiosInstance.get('/v1/bills');
  return res.data.data as BillItem[];
}

export type CreateBillPayload = {
  userId?: number; // optional; backend will use JWT if present
  itemDescription: string;
  logoUrl?: string | null;
  dueDate: string; // YYYY-MM-DD
  lastChargeDate?: string | null; // YYYY-MM-DD
  amount: number;
};

export type CreateBillResponse = {
  message: string;
  data: BillItem;
};

/**
 * Tạo hóa đơn mới
 */
export async function createBill(payload: CreateBillPayload): Promise<CreateBillResponse> {
  const res = await axiosInstance.post('/v1/bills', payload);
  return res.data as CreateBillResponse;
}


