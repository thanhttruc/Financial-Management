/**
 * Các constant chung trong ứng dụng
 */

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

// Account Types
export const ACCOUNT_TYPES = {
  BANK: 'bank',
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  SAVINGS: 'savings',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
} as const;
