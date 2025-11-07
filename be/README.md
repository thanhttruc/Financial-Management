# 🏦 Financial Management - Backend API

API Backend cho ứng dụng quản lý tài chính cá nhân, được xây dựng bằng NestJS.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Entity & Database](#entity--database)
- [API Documentation](#api-documentation)

## 📖 Tổng quan

Dự án này sử dụng:
- **NestJS**: Framework Node.js với TypeScript
- **TypeORM**: ORM cho database
- **MySQL**: Database
- **Swagger**: API documentation
- **class-validator**: Validation cho DTO

## 💻 Yêu cầu hệ thống

- Node.js >= 20.x
- MySQL >= 8.0
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Clone repository và di chuyển vào folder backend

```bash
cd be
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình database

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin database của bạn:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=financial
```

### 4. Tạo database và import schema

```bash
# Tạo database
mysql -u root -p
CREATE DATABASE financial;

# Import schema từ file database_init.sql ở root folder
mysql -u root -p financial < ../database_init.sql
```

## ⚙️ Cấu hình

### Biến môi trường

File `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=financial

# Server
PORT=8000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:1574
```

### TypeORM Configuration

TypeORM được cấu hình trong `src/app.module.ts`:
- Kết nối đến MySQL
- Tự động sync schema trong development (nên tắt trong production)
- Logging queries trong development

## 🏃 Chạy ứng dụng

### Development mode

```bash
npm run start:dev
```

Server sẽ chạy tại: `http://localhost:8000`

### Production mode

```bash
npm run build
npm run start:prod
```

### Debug mode

```bash
npm run start:debug
```

## 📁 Cấu trúc thư mục

```
be/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── config/                    # Configuration files
│   │   └── database.config.ts     # Database config
│   ├── common/                    # Shared utilities, decorators, guards
│   ├── modules/                   # Feature modules
│   │   ├── user/
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── account/
│   │   │   └── entities/
│   │   │       └── account.entity.ts
│   │   ├── transaction/
│   │   │   └── entities/
│   │   │       └── transaction.entity.ts
│   │   ├── category/
│   │   │   └── entities/
│   │   │       └── category.entity.ts
│   │   ├── expense-detail/
│   │   │   └── entities/
│   │   │       └── expense-detail.entity.ts
│   │   ├── bill/
│   │   │   └── entities/
│   │   │       └── bill.entity.ts
│   │   └── goal/
│   │       └── entities/
│   │           └── goal.entity.ts
│   ├── filters/                   # Exception filters
│   ├── interceptors/              # Interceptors
│   └── database/                  # Database config files
├── .env                           # Environment variables
├── .env.example                   # Environment variables template
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
└── README.md                      # Documentation
```

## 🗄️ Entity & Database

Project có 7 entity chính:

1. **User** - Người dùng
2. **Account** - Tài khoản (bank, credit card, etc.)
3. **Transaction** - Giao dịch (thu/chi)
4. **Category** - Danh mục chi tiêu
5. **ExpenseDetail** - Chi tiết chi tiêu
6. **Bill** - Hóa đơn sắp tới
7. **Goal** - Mục tiêu tiết kiệm/chi tiêu

### Quan hệ giữa các entity:

```
User
  ├─> Account (one-to-many)
  ├─> Bill (one-to-many)
  └─> Goal (one-to-many)

Account
  └─> Transaction (one-to-many)

Transaction
  └─> ExpenseDetail (one-to-one)

Category
  ├─> ExpenseDetail (one-to-many)
  └─> Goal (one-to-many)
```

## 📚 API Documentation

Sau khi chạy server, truy cập Swagger UI tại:

```
http://localhost:8000/api
```

Swagger sẽ hiển thị tất cả các endpoint API (khi đã được implement).

## 🔧 Scripts

- `npm run start` - Chạy production build
- `npm run start:dev` - Chạy development mode với hot reload
- `npm run start:debug` - Chạy debug mode
- `npm run build` - Build TypeScript
- `npm run format` - Format code với Prettier
- `npm run lint` - Lint code

## 🎯 Next Steps

1. Implement các module với controller, service, DTO
2. Thêm authentication & authorization (JWT)
3. Thêm validation và error handling
4. Thêm logging và monitoring
5. Thêm unit tests

## 📝 Chú ý

- Project hiện tại **KHÔNG có authentication**, cần implement sau
- Entity đã được tạo dựa trên database schema
- Swagger đã được cấu hình sẵn
- Đang ở giai đoạn base setup, chưa có business logic

## 🤝 Contributing

Follow coding conventions:
- **camelCase** cho biến và hàm
- **PascalCase** cho class và entity
- **kebab-case** cho thư mục
- Dùng `class-validator` cho validation

---

**Happy Coding!** 🚀

