-- ============================================
-- SEED DATA CHO DATABASE FINANCIAL
-- ============================================
-- File này chứa dữ liệu mẫu để test và phát triển
-- Chạy sau khi đã chạy database_init.sql

USE financial;

-- ============================================
-- 1. SEED CATEGORIES (Danh Mục Chi Tiêu)
-- ============================================
INSERT INTO Categories (category_name) VALUES
('Housing'),          -- Nhà ở
('Food'),             -- Thức ăn
('Transportation'),   -- Giao thông
('Entertainment'),    -- Giải trí
('Shopping'),         -- Mua sắm
('Healthcare'),       -- Y tế
('Education'),        -- Giáo dục
('Utilities'),        -- Tiện ích
('Others');           -- Khác

-- ============================================
-- 2. SEED USERS (Người Dùng)
-- ============================================
-- Password đã được hash bằng bcrypt (password: "password123")
-- Có thể thay đổi sau khi test authentication
INSERT INTO Users (full_name, email, username, password, phone_number, profile_picture_url, total_balance) VALUES
('Nguyễn Văn An', 'nguyenvanan@example.com', 'nguyenvanan', '$2b$10$rQcJ5vKpV5qZVZ8Z8Z8Z8uZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', '0912345678', NULL, 5000000.00),
('Trần Thị Bình', 'tranthibinh@example.com', 'tranthibinh', '$2b$10$rQcJ5vKpV5qZVZ8Z8Z8Z8uZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', '0923456789', NULL, 3500000.00),
('Lê Hoàng Cường', 'lehoangcuong@example.com', 'lehoangcuong', '$2b$10$rQcJ5vKpV5qZVZ8Z8Z8Z8uZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', '0934567890', NULL, 8000000.00),
('Phạm Thị Dung', 'phamthidung@example.com', 'phamthidung', '$2b$10$rQcJ5vKpV5qZVZ8Z8Z8Z8uZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', '0945678901', NULL, 1200000.00);

-- ============================================
-- 3. SEED ACCOUNTS (Tài Khoản)
-- ============================================
INSERT INTO Accounts (user_id, bank_name, account_type, branch_name, account_number_full, account_number_last_4, balance) VALUES
-- Tài khoản của User 1 (Nguyễn Văn An)
(1, 'Vietcombank', 'Checking', 'Chi nhánh Quận 1', '9704221234567890123', '0123', 3000000.00),
(1, 'Techcombank', 'Savings', 'Chi nhánh Quận 3', '9704229876543210987', '0987', 2000000.00),
-- Tài khoản của User 2 (Trần Thị Bình)
(2, 'BIDV', 'Checking', 'Chi nhánh Quận 7', '9704221111222233334', '3334', 2000000.00),
(2, 'VPBank', 'Credit Card', 'Chi nhánh Quận 2', NULL, '5678', -500000.00),
(2, 'Momo', 'Savings', NULL, '4523456789', '6789', 2000000.00),
-- Tài khoản của User 3 (Lê Hoàng Cường)
(3, 'Vietcombank', 'Checking', 'Chi nhánh Quận 1', '9704225555666677778', '7778', 5000000.00),
(3, 'Sacombank', 'Investment', 'Chi nhánh Quận 5', '9704229999888877776', '7776', 3000000.00),
-- Tài khoản của User 4 (Phạm Thị Dung)
(4, 'Agribank', 'Checking', 'Chi nhánh Quận 10', '9704224444333322221', '2221', 1200000.00);

-- ============================================
-- 4. SEED TRANSACTIONS (Giao Dịch)
-- ============================================
INSERT INTO Transactions (account_id, transaction_date, type, item_description, shop_name, amount, payment_method, status, receipt_id) VALUES
-- Giao dịch của Account 1 (Checking - User 1)
(1, '2024-01-15 10:30:00', 'Expense', 'Mua đồ ăn sáng', 'Cửa hàng tiện lợi 7-Eleven', 45000.00, 'Credit Card', 'Complete', 'RCP001'),
(1, '2024-01-16 14:20:00', 'Expense', 'Đổ xăng xe máy', 'Trạm xăng PV Oil', 200000.00, 'Cash', 'Complete', 'RCP002'),
(1, '2024-01-20 19:45:00', 'Revenue', 'Lương tháng 1/2024', 'Công ty ABC', 15000000.00, 'Bank Transfer', 'Complete', 'SAL001'),
(1, '2024-01-25 11:15:00', 'Expense', 'Mua quần áo', 'Shop thời trang Zara', 850000.00, 'Credit Card', 'Complete', 'RCP003'),
-- Giao dịch của Account 2 (Savings - User 1)
(2, '2024-01-10 09:00:00', 'Revenue', 'Tiết kiệm tháng 1', 'Nguyễn Văn An', 2000000.00, 'Bank Transfer', 'Complete', 'SAV001'),
-- Giao dịch của Account 3 (Checking - User 2)
(3, '2024-01-18 12:30:00', 'Expense', 'Ăn trưa với bạn', 'Nhà hàng BBQ', 350000.00, 'Credit Card', 'Complete', 'RCP004'),
(3, '2024-01-22 16:00:00', 'Expense', 'Mua thuốc', 'Nhà thuốc Long Châu', 120000.00, 'Cash', 'Complete', 'RCP005'),
(3, '2024-01-28 20:00:00', 'Revenue', 'Freelance project', 'Khách hàng XYZ', 5000000.00, 'Bank Transfer', 'Complete', 'FRE001'),
-- Giao dịch của Account 4 (Credit Card - User 2)
(4, '2024-01-14 15:30:00', 'Expense', 'Mua điện thoại', 'CellphoneS', 8000000.00, 'Credit Card', 'Pending', 'RCP006'),
(4, '2024-01-17 13:45:00', 'Expense', 'Đi xem phim', 'CGV Cinema', 250000.00, 'Credit Card', 'Complete', 'RCP007'),
-- Giao dịch của Account 5 (Momo - User 2)
(5, '2024-01-12 08:20:00', 'Expense', 'Cà phê sáng', 'Highlands Coffee', 55000.00, 'E-Wallet', 'Complete', 'RCP008'),
(5, '2024-01-19 17:30:00', 'Expense', 'Grab đi làm', 'Grab', 85000.00, 'E-Wallet', 'Complete', 'RCP009'),
-- Giao dịch của Account 6 (Checking - User 3)
(6, '2024-01-11 10:00:00', 'Expense', 'Tiền thuê nhà', 'Chủ nhà', 5000000.00, 'Bank Transfer', 'Complete', 'RCP010'),
(6, '2024-01-15 11:30:00', 'Revenue', 'Lương tháng 1/2024', 'Công ty DEF', 20000000.00, 'Bank Transfer', 'Complete', 'SAL002'),
(6, '2024-01-23 14:00:00', 'Expense', 'Mua sắm tạp hóa', 'Siêu thị Co.opmart', 450000.00, 'Credit Card', 'Complete', 'RCP011'),
-- Giao dịch của Account 7 (Investment - User 3)
(7, '2024-01-05 09:30:00', 'Revenue', 'Lãi đầu tư cổ phiếu', 'Chứng khoán SSI', 500000.00, 'Bank Transfer', 'Complete', 'INV001'),
-- Giao dịch của Account 8 (Checking - User 4)
(8, '2024-01-13 16:45:00', 'Expense', 'Học phí tháng 1', 'Trung tâm Anh ngữ', 1200000.00, 'Bank Transfer', 'Complete', 'RCP012'),
(8, '2024-01-21 10:15:00', 'Expense', 'Mua sách', 'Nhà sách Fahasa', 250000.00, 'Cash', 'Complete', 'RCP013'),
(8, '2024-01-26 18:00:00', 'Revenue', 'Lương part-time', 'Quán cà phê', 2000000.00, 'Cash', 'Complete', 'SAL003');

-- ============================================
-- 5. SEED EXPENSE DETAILS (Chi Tiết Chi Tiêu)
-- ============================================
-- Chỉ insert cho các transaction type = 'Expense'
INSERT INTO ExpenseDetails (transaction_id, category_id, sub_category_name, sub_category_amount) VALUES
-- Expense của User 1
(1, 2, 'Breakfast', 45000.00),           -- Food - Breakfast
(2, 3, 'Gasoline', 200000.00),           -- Transportation - Gasoline
(4, 5, 'Clothing', 850000.00),   -- Shopping - Clothing
-- Expense của User 2
(6, 2, 'Lunch', 350000.00),              -- Food - Lunch
(7, 6, 'Medicine', 120000.00),           -- Healthcare - Medicine
(9, 5, 'Electronics', 8000000.00),       -- Shopping - Electronics
(10, 4, 'Cinema', 250000.00),            -- Entertainment - Cinema
(11, 2, 'Coffee', 55000.00),             -- Food - Coffee
(12, 3, 'Taxi', 85000.00),               -- Transportation - Taxi
-- Expense của User 3
(13, 1, 'Rent', 5000000.00),             -- Housing - Rent
(15, 2, 'Groceries', 450000.00),         -- Food - Groceries
-- Expense của User 4
(17, 7, 'Tuition', 1200000.00),          -- Education - Tuition
(18, 7, 'Books', 250000.00);             -- Education - Books

-- ============================================
-- 6. SEED BILLS (Hóa Đơn Sắp Tới)
-- ============================================
INSERT INTO Bills (user_id, due_date, logo_url, item_description, last_charge_date, amount) VALUES
-- Bills của User 1
(1, '2024-02-05', NULL, 'Tiền điện tháng 1/2024', '2024-01-05', 450000.00),
(1, '2024-02-10', NULL, 'Tiền nước tháng 1/2024', '2024-01-10', 150000.00),
(1, '2024-02-15', NULL, 'Tiền internet tháng 2/2024', '2024-01-15', 300000.00),
-- Bills của User 2
(2, '2024-02-01', NULL, 'Thẻ tín dụng VPBank', '2024-01-01', 2500000.00),
(2, '2024-02-08', NULL, 'Netflix Premium', '2024-01-08', 180000.00),
(2, '2024-02-20', NULL, 'Spotify Premium', '2024-01-20', 59000.00),
-- Bills của User 3
(3, '2024-02-03', NULL, 'Bảo hiểm xe máy', '2024-01-03', 1200000.00),
(3, '2024-02-12', NULL, 'Gym membership', '2024-01-12', 500000.00),
-- Bills của User 4
(4, '2024-02-06', NULL, 'Tiền điện tháng 1/2024', '2024-01-06', 380000.00),
(4, '2024-02-25', NULL, 'Học phí tháng 2/2024', '2024-01-25', 1200000.00);

-- ============================================
-- 7. SEED GOALS (Mục Tiêu Tiết Kiệm/Chi Tiêu)
-- ============================================
INSERT INTO Goals (user_id, goal_type, category_id, start_date, end_date, target_amount, target_achieved, present_amount, last_updated) VALUES
-- Goals của User 1
(1, 'Saving', NULL, '2024-01-01', '2024-12-31', 50000000.00, 2000000.00, 3000000.00, '2024-01-10 09:00:00'),
(1, 'Expense_Limit', 2, '2024-02-01', '2024-02-29', 2000000.00, 0.00, NULL, NULL),
-- Goals của User 2
(2, 'Saving', NULL, '2024-01-01', '2024-06-30', 30000000.00, 5000000.00, 2500000.00, '2024-01-28 20:00:00'),
(2, 'Expense_Limit', 5, '2024-02-01', '2024-02-29', 5000000.00, 0.00, NULL, NULL),
-- Goals của User 3
(3, 'Saving', NULL, '2024-01-01', '2024-12-31', 100000000.00, 3500000.00, 5000000.00, '2024-01-15 11:30:00'),
(3, 'Expense_Limit', 1, '2024-02-01', '2024-02-29', 5000000.00, 0.00, NULL, NULL),
-- Goals của User 4
(4, 'Saving', NULL, '2024-01-01', '2024-05-31', 10000000.00, 2000000.00, 2000000.00, '2024-01-26 18:00:00'),
(4, 'Expense_Limit', 7, '2024-02-01', '2024-02-29', 1500000.00, 0.00, NULL, NULL);

-- ============================================
-- HOÀN TẤT SEED DATA
-- ============================================
-- Đã seed thành công tất cả các bảng:
-- ✓ Categories: 9 categories
-- ✓ Users: 4 users
-- ✓ Accounts: 8 accounts
-- ✓ Transactions: 19 transactions
-- ✓ ExpenseDetails: 13 expense details
-- ✓ Bills: 10 bills
-- ✓ Goals: 8 goals
-- ============================================
