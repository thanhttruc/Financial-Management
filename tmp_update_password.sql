USE financial;
SET @p := '$2b$10$JDwOQHj5wHYVRldjzj0r4.77Hse2iA.gutNsPwGwwlo299MNFsa.q';
UPDATE Users SET password=@p WHERE email IN ('nguyenvanan@example.com','tranthibinh@example.com','lehoangcuong@example.com','phamthidung@example.com');
SELECT email, LENGTH(password) len FROM Users WHERE email='nguyenvanan@example.com';
