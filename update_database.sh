#!/bin/bash

# Script để cập nhật database với dữ liệu seed mới
# Sử dụng: ./update_database.sh [mysql_password]

echo "🔄 Đang cập nhật database..."

# Lấy đường dẫn đến file seed
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SEED_FILE="$SCRIPT_DIR/database_seed.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo "❌ Không tìm thấy file: $SEED_FILE"
    exit 1
fi

# Kiểm tra nếu có password được truyền vào
if [ -z "$1" ]; then
    echo "📝 Vui lòng nhập mật khẩu MySQL:"
    mysql -u root -p financial < "$SEED_FILE"
else
    mysql -u root -p"$1" financial < "$SEED_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Database đã được cập nhật thành công!"
    echo "🔑 Tất cả người dùng hiện có mật khẩu: password123"
else
    echo "❌ Có lỗi xảy ra khi cập nhật database!"
    exit 1
fi

