#!/bin/bash

# Script để import database financial1
# Sử dụng: ./import_database.sh

echo "Đang tạo database và bảng..."
mysql -u root -p < database_init.sql

echo "Đang import dữ liệu seed..."
mysql -u root -p < database_seed.sql

echo "Đang lấy thông tin user..."
mysql -u root -p financial1 -e "SELECT email, password FROM Users;"

echo "Hoàn thành!"

