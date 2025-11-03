-- ============================================
-- MIGRATION: Thêm soft delete columns (deleted_at)
-- Cho bảng Accounts và Transactions
-- ============================================

USE financial;

-- Thêm deleted_at column vào bảng Accounts
ALTER TABLE Accounts 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at;

-- Thêm deleted_at column vào bảng Transactions
ALTER TABLE Transactions 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER created_at;

-- Tạo index để tối ưu query với soft delete
CREATE INDEX idx_accounts_deleted_at ON Accounts(deleted_at);
CREATE INDEX idx_transactions_deleted_at ON Transactions(deleted_at);

-- ============================================
-- Lưu ý:
-- - deleted_at = NULL nghĩa là record chưa bị xóa
-- - deleted_at != NULL nghĩa là record đã bị soft delete
-- - TypeORM sẽ tự động filter các record có deleted_at = NULL khi query
-- ============================================
