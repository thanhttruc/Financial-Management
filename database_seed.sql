-- ============================================
-- SEED DATA CHO DATABASE FINANCIAL (2025)
-- ============================================

USE financial;

-- ============================================
-- XÓA DỮ LIỆU CŨ (Nếu có)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM ExpenseDetails;
DELETE FROM Transactions;
DELETE FROM Bills;
DELETE FROM Goals;
DELETE FROM Accounts;
DELETE FROM Users;
DELETE FROM Categories;
ALTER TABLE ExpenseDetails AUTO_INCREMENT = 1;
ALTER TABLE Transactions AUTO_INCREMENT = 1;
ALTER TABLE Bills AUTO_INCREMENT = 1;
ALTER TABLE Goals AUTO_INCREMENT = 1;
ALTER TABLE Accounts AUTO_INCREMENT = 1;
ALTER TABLE Users AUTO_INCREMENT = 1;
ALTER TABLE Categories AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. SEED CATEGORIES (Danh Mục Chi Tiêu)
-- ============================================
INSERT INTO Categories (category_name) VALUES
('Housing'), ('Food'), ('Transportation'), ('Entertainment'),
('Shopping'), ('Others');

-- ============================================
-- 2. SEED USERS (Người Dùng)
-- ============================================
INSERT INTO Users (full_name, email, username, password, phone_number, profile_picture_url, total_balance) VALUES
('Nguyễn Văn An', 'nguyenvanan@example.com', 'nguyenvanan', '$2b$10$C5hYvZpWpw7n6vVwUmUu1u4cSXRfDsUgHqpY2Rr.k4tu6H5g1nS5S', '0912345678', NULL, 8000000.00),
('Trần Thị Bình', 'tranthibinh@example.com', 'tranthibinh', '$2b$10$C5hYvZpWpw7n6vVwUmUu1u4cSXRfDsUgHqpY2Rr.k4tu6H5g1nS5S', '0923456789', NULL, 6000000.00),
('Lê Hoàng Cường', 'lehoangcuong@example.com', 'lehoangcuong', '$2b$10$C5hYvZpWpw7n6vVwUmUu1u4cSXRfDsUgHqpY2Rr.k4tu6H5g1nS5S', '0934567890', NULL, 12000000.00),
('Phạm Thị Dung', 'phamthidung@example.com', 'phamthidung', '$2b$10$C5hYvZpWpw7n6vVwUmUu1u4cSXRfDsUgHqpY2Rr.k4tu6H5g1nS5S', '0945678901', NULL, 4000000.00);

-- ============================================
-- 3. SEED ACCOUNTS (Tài Khoản)
-- ============================================
INSERT INTO Accounts (user_id, bank_name, account_type, branch_name, account_number_full, account_number_last_4, balance) VALUES
(1, 'Vietcombank', 'Checking', 'Quận 1', '9704221234567890123', '0123', 4000000.00),
(1, 'Techcombank', 'Savings', 'Quận 3', '9704229876543210987', '0987', 4000000.00),
(2, 'BIDV', 'Checking', 'Quận 7', '9704221111222233334', '3334', 3000000.00),
(2, 'VPBank', 'Credit Card', 'Quận 2', NULL, '5678', -500000.00),
(2, 'Momo', 'Savings', NULL, '4523456789', '6789', 3500000.00),
(3, 'Vietcombank', 'Checking', 'Quận 1', '9704225555666677778', '7778', 7000000.00),
(3, 'Sacombank', 'Investment', 'Quận 5', '9704229999888877776', '7776', 5000000.00),
(4, 'Agribank', 'Checking', 'Quận 10', '9704224444333322221', '2221', 4000000.00);

-- ============================================
-- 4. SEED TRANSACTIONS (Giao Dịch — Năm 2025)
-- ============================================
INSERT INTO Transactions (account_id, transaction_date, type, item_description, shop_name, amount, payment_method, status, receipt_id) VALUES
-- User 1 (Nguyễn Văn An)
(1, '2025-01-05 09:00:00', 'Expense', 'Mua cà phê sáng', 'Highlands Coffee', 55000, 'Credit Card', 'Complete', 'RCP001'),
(1, '2025-01-10 11:30:00', 'Expense', 'Đổ xăng xe máy', 'PV Oil', 120000, 'Cash', 'Complete', 'RCP002'),
(1, '2025-01-15 19:00:00', 'Revenue', 'Lương tháng 1', 'Công ty ABC', 15000000, 'Bank Transfer', 'Complete', 'SAL001'),
(1, '2025-01-18 20:00:00', 'Expense', 'Đi xem phim', 'CGV', 200000, 'Credit Card', 'Complete', 'RCP003'),
(1, '2025-02-03 08:00:00', 'Expense', 'Tiền điện tháng 1', 'EVN HCMC', 500000, 'Bank Transfer', 'Complete', 'RCP004'),
(1, '2025-02-05 10:00:00', 'Expense', 'Mua đồ ăn sáng', '7-Eleven', 45000, 'Cash', 'Complete', 'RCP005'),
(2, '2025-02-12 14:00:00', 'Revenue', 'Chuyển tiết kiệm', 'Nguyễn Văn An', 2000000, 'Bank Transfer', 'Complete', 'SAV001'),
(1, '2025-03-10 17:00:00', 'Expense', 'Mua quần áo', 'Zara', 900000, 'Credit Card', 'Complete', 'RCP006'),
(1, '2025-03-20 13:30:00', 'Expense', 'Ăn trưa', 'Cơm tấm Ba Ghiền', 75000, 'Cash', 'Complete', 'RCP007'),
(1, '2025-04-01 09:00:00', 'Revenue', 'Thưởng quý 1', 'Công ty ABC', 5000000, 'Bank Transfer', 'Complete', 'BON001'),
(2, '2025-11-05 08:30:00', 'Expense', 'Tiền thuê nhà tháng 11', 'Chủ nhà', 5500000, 'Bank Transfer', 'Complete', 'RCP026'),
(2, '2025-11-06 12:00:00', 'Expense', 'Ăn trưa cùng bạn', 'Phở 24', 90000, 'Cash', 'Complete', 'RCP027'),
(2, '2025-11-10 09:15:00', 'Expense', 'Đổ xăng xe máy', 'Petrolimex', 120000, 'Cash', 'Complete', 'RCP028'),
(2, '2025-11-15 20:00:00', 'Expense', 'Đi xem phim cuối tuần', 'CGV Vincom', 180000, 'Credit Card', 'Complete', 'RCP029'),
(1, '2025-11-18 14:30:00', 'Expense', 'Mua áo len mùa đông', 'H&M', 750000, 'Credit Card', 'Complete', 'RCP030'),
(1, '2025-11-25 10:00:00', 'Expense', 'Ủng hộ quỹ từ thiện', 'Quỹ Trái tim Việt', 300000, 'Bank Transfer', 'Complete', 'RCP031'),


-- User 2 (Trần Thị Bình)
(3, '2025-01-07 12:00:00', 'Expense', 'Ăn trưa với đồng nghiệp', 'Nhà hàng Gogi', 280000, 'Credit Card', 'Complete', 'RCP008'),
(3, '2025-01-09 09:30:00', 'Expense', 'Mua thuốc', 'Nhà thuốc Long Châu', 150000, 'Cash', 'Complete', 'RCP009'),
(3, '2025-01-25 10:00:00', 'Revenue', 'Lương tháng 1', 'Công ty XYZ', 13000000, 'Bank Transfer', 'Complete', 'SAL002'),
(4, '2025-02-02 18:00:00', 'Expense', 'Thanh toán thẻ tín dụng', 'VPBank', 2000000, 'Credit Card', 'Complete', 'RCP010'),
(5, '2025-02-12 08:00:00', 'Expense', 'Grab đi làm', 'Grab', 95000, 'E-Wallet', 'Complete', 'RCP011'),
(5, '2025-02-15 20:00:00', 'Expense', 'Netflix Premium', 'Netflix', 180000, 'E-Wallet', 'Complete', 'RCP012'),
(5, '2025-03-10 15:00:00', 'Revenue', 'Freelance project', 'Khách hàng ABC', 6000000, 'Bank Transfer', 'Complete', 'FRE001'),
(3, '2025-03-18 19:30:00', 'Expense', 'Đi ăn tối', 'Nhà hàng Lẩu Kichi', 350000, 'Credit Card', 'Complete', 'RCP013'),
(4, '2025-04-03 09:00:00', 'Expense', 'Mua quần áo', 'Uniqlo', 700000, 'Credit Card', 'Complete', 'RCP014'),
(4, '2025-11-03 08:00:00', 'Expense', 'Tiền thuê phòng trọ', 'Chủ nhà', 3500000, 'Bank Transfer', 'Complete', 'RCP032'),
(4, '2025-11-05 13:00:00', 'Expense', 'Mua đồ ăn trưa', 'Bún chả Hương Liên', 80000, 'Cash', 'Complete', 'RCP033'),
(5, '2025-11-09 09:00:00', 'Expense', 'Grab đi làm', 'Grab', 70000, 'E-Wallet', 'Complete', 'RCP034'),
(5, '2025-11-15 19:00:00', 'Expense', 'Xem ca nhạc', 'Nhà hát Hòa Bình', 350000, 'Credit Card', 'Complete', 'RCP035'),
(3, '2025-11-20 11:00:00', 'Expense', 'Mua váy', 'Canifa', 600000, 'Credit Card', 'Complete', 'RCP036'),
(3, '2025-11-26 17:30:00', 'Expense', 'Tặng quà sinh nhật bạn', 'Miniso', 250000, 'Cash', 'Complete', 'RCP037'),

-- User 3 (Lê Hoàng Cường)
(6, '2025-01-10 10:00:00', 'Expense', 'Tiền thuê nhà', 'Chủ nhà', 5500000, 'Bank Transfer', 'Complete', 'RCP015'),
(6, '2025-01-15 11:30:00', 'Revenue', 'Lương tháng 1', 'Công ty DEF', 20000000, 'Bank Transfer', 'Complete', 'SAL003'),
(6, '2025-01-18 16:00:00', 'Expense', 'Mua sắm tạp hóa', 'Co.opmart', 480000, 'Credit Card', 'Complete', 'RCP016'),
(7, '2025-01-22 09:30:00', 'Revenue', 'Lãi cổ phiếu', 'SSI', 1000000, 'Bank Transfer', 'Complete', 'INV001'),
(6, '2025-02-05 19:00:00', 'Expense', 'Đi xem phim', 'CGV', 220000, 'Credit Card', 'Complete', 'RCP017'),
(7, '2025-02-15 12:00:00', 'Expense', 'Ăn trưa', 'Nhà hàng BBQ', 180000, 'Cash', 'Complete', 'RCP018'),
(6, '2025-03-01 09:00:00', 'Expense', 'Tiền điện tháng 2', 'EVN', 500000, 'Bank Transfer', 'Complete', 'RCP019'),
(7, '2025-03-10 09:00:00', 'Revenue', 'Chuyển lợi nhuận đầu tư', 'SSI', 2500000, 'Bank Transfer', 'Complete', 'INV002'),
(6, '2025-12-01 10:00:00', 'Expense', 'Tiền thuê nhà tháng 12', 'Chủ nhà', 6000000, 'Bank Transfer', 'Complete', 'RCP038'),
(6, '2025-12-03 12:15:00', 'Expense', 'Ăn trưa công ty', 'Cơm gà Hải Nam', 100000, 'Cash', 'Complete', 'RCP039'),
(7, '2025-12-05 09:30:00', 'Expense', 'Đổ xăng ô tô', 'PV Oil', 800000, 'Bank Transfer', 'Complete', 'RCP040'),
(7, '2025-12-10 20:00:00', 'Expense', 'Đi du lịch cuối năm', 'Vietravel', 4000000, 'Credit Card', 'Complete', 'RCP041'),
(7, '2025-12-18 15:00:00', 'Expense', 'Mua quà Noel', 'Aeon Mall', 1500000, 'Credit Card', 'Complete', 'RCP042'),
(6, '2025-12-22 09:00:00', 'Expense', 'Ủng hộ chương trình thiện nguyện', 'VTV Charity', 500000, 'Bank Transfer', 'Complete', 'RCP043'),

-- User 4 (Phạm Thị Dung)
(8, '2025-01-05 16:45:00', 'Expense', 'Học phí tháng 1', 'Trung tâm Anh ngữ', 1200000, 'Bank Transfer', 'Complete', 'RCP020'),
(8, '2025-01-20 10:15:00', 'Expense', 'Mua sách', 'Nhà sách Fahasa', 350000, 'Cash', 'Complete', 'RCP021'),
(8, '2025-01-28 18:00:00', 'Revenue', 'Lương part-time', 'Quán cà phê', 2000000, 'Cash', 'Complete', 'SAL004'),
(8, '2025-02-05 09:00:00', 'Expense', 'Tiền điện', 'EVN', 400000, 'Bank Transfer', 'Complete', 'RCP022'),
(8, '2025-02-10 15:30:00', 'Expense', 'Mua đồ học tập', 'Văn phòng phẩm Thiên Long', 150000, 'Cash', 'Complete', 'RCP023'),
(8, '2025-02-15 11:00:00', 'Revenue', 'Gia sư toán', 'Học sinh A', 1000000, 'Cash', 'Complete', 'SAL005'),
(8, '2025-03-10 10:30:00', 'Expense', 'Tiền nước', 'Cấp nước HCM', 250000, 'Bank Transfer', 'Complete', 'RCP024'),
(8, '2025-03-25 19:00:00', 'Expense', 'Đi xem phim', 'CGV', 200000, 'Credit Card', 'Complete', 'RCP025'),
(8, '2025-11-04 09:00:00', 'Expense', 'Tiền nhà trọ tháng 11', 'Cô chủ trọ', 1800000, 'Bank Transfer', 'Complete', 'RCP044'),
(8, '2025-11-07 12:30:00', 'Expense', 'Ăn cơm trưa', 'Cơm gà xối mỡ', 45000, 'Cash', 'Complete', 'RCP045'),
(8, '2025-11-09 08:00:00', 'Expense', 'Đi xe buýt đến trường', 'Busline 01', 8000, 'Cash', 'Complete', 'RCP046'),
(8, '2025-11-12 19:00:00', 'Expense', 'Đi xem phim với bạn', 'CGV Landmark', 150000, 'Credit Card', 'Complete', 'RCP047'),
(8, '2025-11-20 14:00:00', 'Expense', 'Mua giày mới', 'Biti’s', 550000, 'Credit Card', 'Complete', 'RCP048'),
(8, '2025-11-25 09:00:00', 'Expense', 'Mua quà cho mẹ', 'Shopee', 200000, 'E-Wallet', 'Complete', 'RCP049');

-- ============================================
-- 5. SEED EXPENSE DETAILS (Chi Tiết Chi Tiêu)
-- ============================================
INSERT INTO ExpenseDetails (transaction_id, category_id, sub_category_name, sub_category_amount) VALUES
(1, 2, 'Coffee', 55000), (2, 3, 'Gasoline', 120000), (4, 4, 'Movie', 200000),
(5, 6, 'Electricity', 500000), (6, 2, 'Breakfast', 45000), (9, 2, 'Lunch', 75000),
(10, 5, 'Clothing', 900000),
(11, 2, 'Lunch', 280000), (12, 6, 'Medicine', 150000), (14, 5, 'Clothing', 700000),
(15, 1, 'Rent', 5500000), (17, 4, 'Movie', 220000), (18, 2, 'Lunch', 180000),
(20, 6, 'Tuition', 1200000), (21, 6, 'Books', 350000), (22, 6, 'Electricity', 400000),
(24, 6, 'Water', 250000),(25, 1, 'Rent', 5500000), (26, 2, 'Lunch', 90000),(27, 3, 'Gasoline', 120000),
(28, 4, 'Movie', 180000), (29, 5, 'Clothing', 750000), (30, 6, 'Donation', 300000),

-- User 2
(31, 1, 'Rent', 3500000),(32, 2, 'Food', 80000),(33, 3, 'Transport', 70000),
(34, 4, 'Entertainment', 350000), (35, 5, 'Shopping', 600000), (36, 6, 'Gift', 250000),

-- User 3
(37, 1, 'Rent', 6000000), (38, 2, 'Meal', 100000), (39, 3, 'Fuel', 800000),
(40, 4, 'Travel', 4000000),(41, 5, 'Gift', 1500000), (42, 6, 'Donation', 500000),

-- User 4
(43, 1, 'Rent', 1800000), (44, 2, 'Food', 45000), (45, 3, 'Bus Ticket', 8000),
(46, 4, 'Movie', 150000), (47, 5, 'Shopping', 550000), (48, 6, 'Gift', 200000);


-- ============================================
-- 6. SEED BILLS (Hóa Đơn — 2025)
-- ============================================
INSERT INTO Bills (user_id, due_date, logo_url, item_description, last_charge_date, amount) VALUES
(1, '2025-04-05', NULL, 'Tiền điện tháng 3', '2025-03-05', 500000),
(1, '2025-04-10', NULL, 'Tiền nước tháng 3', '2025-03-10', 200000),
(1, '2025-04-15', NULL, 'Internet VNPT', '2025-03-15', 300000),
(2, '2025-04-01', NULL, 'Thẻ tín dụng VPBank', '2025-03-01', 2500000),
(2, '2025-04-08', NULL, 'Netflix Premium', '2025-03-08', 180000),
(3, '2025-04-03', NULL, 'Bảo hiểm xe máy', '2025-03-03', 1200000),
(3, '2025-04-12', NULL, 'Gym membership', '2025-03-12', 500000),
(4, '2025-04-06', NULL, 'Figma Account', '2025-03-06', 380000),
(4, '2025-04-25', NULL, 'Học phí tháng 4', '2025-03-25', 1200000);

-- ============================================
-- 7. SEED GOALS (Mục Tiêu Tiết Kiệm/Chi Tiêu)
-- ============================================
INSERT INTO Goals (user_id, goal_type, category_id, start_date, end_date, target_amount, target_achieved, present_amount, last_updated) VALUES
(1, 'Saving', NULL, '2025-11-01', '2025-11-30', 5000000, 0, NULL, NULL),
(1, 'Expense_Limit', 2, '2025-11-01', '2025-11-30', 4000000, 0, NULL, NULL),
(1, 'Expense_Limit', 5, '2025-11-01', '2025-11-30', 2500000, 0, NULL, NULL),
(1, 'Expense_Limit', 4, '2025-11-01', '2025-11-30', 2000000, 0, NULL, NULL),

(2, 'Saving', NULL, '2025-11-01', '2025-11-30', 3000000, 0, NULL, NULL),
(2, 'Expense_Limit', 2, '2025-11-01', '2025-11-30', 3500000, 0, NULL, NULL),
(2, 'Expense_Limit', 5, '2025-11-01', '2025-11-30', 2200000, 0, NULL, NULL),
(2, 'Expense_Limit', 4, '2025-11-01', '2025-11-30', 1800000, 0, NULL, NULL),

(3, 'Saving', NULL, '2025-11-01', '2025-11-30', 6000000, 0, NULL, NULL),
(3, 'Expense_Limit', 2, '2025-11-01', '2025-11-30', 5000000, 0, NULL, NULL),
(3, 'Expense_Limit', 5, '2025-11-01', '2025-11-30', 3000000, 0, NULL, NULL),
(3, 'Expense_Limit', 4, '2025-11-01', '2025-11-30', 2000000, 0, NULL, NULL),

(4, 'Saving', NULL, '2025-11-01', '2025-11-30', 2500000, 0, NULL, NULL),
(4, 'Expense_Limit', 2, '2025-11-01', '2025-11-30', 2800000, 0, NULL, NULL),
(4, 'Expense_Limit', 5, '2025-11-01', '2025-11-30', 1500000, 0, NULL, NULL),
(4, 'Expense_Limit', 4, '2025-11-01', '2025-11-30', 1200000, 0, NULL, NULL);

INSERT INTO Goals (user_id, goal_type, category_id, start_date, end_date, target_amount, target_achieved, present_amount, last_updated) VALUES
-- =========================
-- USER 1
-- =========================
(1, 'Saving', NULL, '2025-01-01', '2025-01-31', 7000000, 4200000, NULL, NULL),
(1, 'Expense_Limit', 2, '2025-01-01', '2025-01-31', 5000000, 3100000, NULL, NULL),
(1, 'Expense_Limit', 4, '2025-01-01', '2025-01-31', 3000000, 2700000, NULL, NULL),
(1, 'Expense_Limit', 5, '2025-01-01', '2025-01-31', 3500000, 2900000, NULL, NULL),

(1, 'Saving', NULL, '2025-02-01', '2025-02-28', 6000000, 3300000, NULL, NULL),
(1, 'Expense_Limit', 2, '2025-02-01', '2025-02-28', 5500000, 4000000, NULL, NULL),
(1, 'Expense_Limit', 5, '2025-02-01', '2025-02-28', 3000000, 2500000, NULL, NULL),

-- =========================
-- USER 2
-- =========================
(2, 'Saving', NULL, '2025-03-01', '2025-03-31', 4000000, 2700000, NULL, NULL),
(2, 'Expense_Limit', 2, '2025-03-01', '2025-03-31', 4000000, 3200000, NULL, NULL),
(2, 'Expense_Limit', 4, '2025-03-01', '2025-03-31', 2500000, 2100000, NULL, NULL),
(2, 'Expense_Limit', 5, '2025-03-01', '2025-03-31', 2800000, 2200000, NULL, NULL),

(2, 'Saving', NULL, '2025-04-01', '2025-04-30', 4500000, 3500000, NULL, NULL),
(2, 'Expense_Limit', 2, '2025-04-01', '2025-04-30', 4200000, 3700000, NULL, NULL),
(2, 'Expense_Limit', 5, '2025-04-01', '2025-04-30', 3000000, 2600000, NULL, NULL),

-- =========================
-- USER 3
-- =========================
(3, 'Saving', NULL, '2025-05-01', '2025-05-31', 8000000, 5500000, NULL, NULL),
(3, 'Expense_Limit', 2, '2025-05-01', '2025-05-31', 5500000, 4100000, NULL, NULL),
(3, 'Expense_Limit', 4, '2025-05-01', '2025-05-31', 2500000, 2000000, NULL, NULL),
(3, 'Expense_Limit', 5, '2025-05-01', '2025-05-31', 4000000, 3100000, NULL, NULL),

(3, 'Saving', NULL, '2025-06-01', '2025-06-30', 7500000, 5000000, NULL, NULL),
(3, 'Expense_Limit', 2, '2025-06-01', '2025-06-30', 6000000, 5200000, NULL, NULL),
(3, 'Expense_Limit', 5, '2025-06-01', '2025-06-30', 3500000, 3000000, NULL, NULL),

-- =========================
-- USER 4
-- =========================
(4, 'Saving', NULL, '2025-07-01', '2025-07-31', 3000000, 1700000, NULL, NULL),
(4, 'Expense_Limit', 2, '2025-07-01', '2025-07-31', 3000000, 2100000, NULL, NULL),
(4, 'Expense_Limit', 4, '2025-07-01', '2025-07-31', 1500000, 1200000, NULL, NULL),
(4, 'Expense_Limit', 5, '2025-07-01', '2025-07-31', 2000000, 1600000, NULL, NULL),

(4, 'Saving', NULL, '2025-08-01', '2025-08-31', 3500000, 1800000, NULL, NULL),
(4, 'Expense_Limit', 2, '2025-08-01', '2025-08-31', 2800000, 2000000, NULL, NULL),
(4, 'Expense_Limit', 5, '2025-08-01', '2025-08-31', 2200000, 1800000, NULL, NULL);
