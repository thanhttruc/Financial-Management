import * as bcrypt from 'bcrypt';
import * as mysql from 'mysql2/promise';
import { config } from 'dotenv';

/**
 * Script để cập nhật password của tất cả users thành "password123" (đã hash)
 */
async function updateAllPasswords() {
  // Load environment variables
  config();

  const passwordToSet = 'password123';
  const saltRounds = 10;

  // Hash password
  console.log('🔐 Đang hash password...');
  const hashedPassword = await bcrypt.hash(passwordToSet, saltRounds);
  console.log(`✅ Password đã được hash: ${hashedPassword.substring(0, 20)}...`);

  // Kết nối database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'financial1',
  });

  console.log('✅ Đã kết nối database');

  try {
    // Cập nhật password cho tất cả users
    const [result]: any = await connection.execute(
      `UPDATE Users SET password = ?`,
      [hashedPassword]
    );

    console.log(`✅ Đã cập nhật password cho ${result.affectedRows} user(s)`);

    // Hiển thị danh sách users đã được cập nhật
    const [users]: any = await connection.execute(
      'SELECT user_id, email, username, full_name FROM Users'
    );
    console.log('\n📋 Danh sách users đã được cập nhật password:');
    users.forEach((user: any) => {
      console.log(`   - ${user.full_name} (${user.email}) - Username: ${user.username}`);
    });

    console.log(`\n✅ Hoàn thành! Tất cả users giờ có password: "${passwordToSet}"`);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật password:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 Đã đóng kết nối database');
  }
}

// Chạy script
updateAllPasswords()
  .then(() => {
    console.log('\n🎉 Script hoàn thành thành công!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script thất bại:', error);
    process.exit(1);
  });

