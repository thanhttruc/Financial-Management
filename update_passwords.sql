-- Cập nhật mật khẩu cho 4 người dùng thành "password123" (đã hash)
USE financial;

UPDATE Users 
SET password = '$2b$10$ydCxFHlRQPxVgeLOltl1Y.W/yg5zuwW1iMJFnAyqGnO6bKWp.g6XG' 
WHERE user_id IN (1, 2, 3, 4);

-- Kiểm tra kết quả
SELECT user_id, full_name, email, username, 
       SUBSTRING(password, 1, 20) as password_hash_preview 
FROM Users 
WHERE user_id IN (1, 2, 3, 4);

