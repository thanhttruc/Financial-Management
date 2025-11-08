-- Tạo database
DROP DATABASE IF EXISTS financial1;
CREATE DATABASE financial1;
USE financial1;
-- 1. Bảng Users (Người Dùng)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(255),
    total_balance DECIMAL(15, 2) DEFAULT 0.00
);

-- ============================================
-- 2. Bảng Accounts (Tài Khoản)
-- ============================================
CREATE TABLE Accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bank_name VARCHAR(100),
    account_type ENUM('Checking', 'Credit Card', 'Savings', 'Investment', 'Loan') NOT NULL,
    branch_name VARCHAR(100),
    account_number_full VARCHAR(50),
    account_number_last_4 CHAR(4),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ============================================
-- 3. Bảng Transactions (Giao Dịch)
-- ============================================
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    transaction_date DATETIME NOT NULL,
    type ENUM('Revenue', 'Expense') NOT NULL,
    item_description VARCHAR(255) NOT NULL,
    shop_name VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('Complete', 'Pending', 'Failed') DEFAULT 'Complete',
    receipt_id VARCHAR(50),
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id)
);

-- ============================================
-- 4. Bảng Categories (Danh Mục Chi Tiêu)
-- ============================================
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL 
    -- Ví dụ: Housing, Food, Transportation, Entertainment, Shopping, Others
);

-- ============================================
-- 5. Bảng ExpenseDetails (Chi Tiết Chi Tiêu)
-- ============================================
-- Bảng này liên kết giao dịch chi tiêu với danh mục
CREATE TABLE ExpenseDetails (
    expense_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT UNIQUE NOT NULL, -- UNIQUE vì mỗi giao dịch chỉ thuộc 1 danh mục chính
    category_id INT NOT NULL,
    sub_category_name VARCHAR(100), -- Ví dụ: House Rent, Grocery
    sub_category_amount DECIMAL(10, 2) NOT NULL, 
    -- Dùng cho các báo cáo phân tích chi tiêu
    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- ============================================
-- 6. Bảng Bills (Hóa Đơn Sắp Tới)
-- ============================================
CREATE TABLE Bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    due_date DATE NOT NULL,
    logo_url VARCHAR(255),
    item_description VARCHAR(255) NOT NULL,
    last_charge_date DATE,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ============================================
-- 7. Bảng Goals (Mục Tiêu Tiết Kiệm/Chi Tiêu)
-- ============================================
CREATE TABLE Goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_type ENUM('Saving', 'Expense_Limit') NOT NULL,
    category_id INT, -- NULL nếu là mục tiêu tiết kiệm tổng thể
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    target_achieved DECIMAL(15, 2) DEFAULT 0.00,
    present_amount DECIMAL(15, 2), -- Số tiền muốn đóng góp thêm
    last_updated DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);