# 🚀 Hướng dẫn Setup Frontend

## ✅ Công việc đã hoàn thành

1. ✓ Khởi tạo React + TypeScript với Vite
2. ✓ Cài đặt TailwindCSS + PostCSS
3. ✓ Cài đặt React Router và Axios
4. ✓ Tạo cấu trúc thư mục chuẩn
5. ✓ Setup API layer với Axios interceptors
6. ✓ Tạo các component cơ bản (Button, Card, Loading, Navigation)
7. ✓ Tạo các pages (Home, Transactions, Accounts, Categories, Goals)
8. ✓ Setup React Router
9. ✓ Tạo utility functions (formatters, validators)
10. ✓ Tạo custom hooks (useDebounce, useLocalStorage)

## 📋 Bước tiếp theo

### 1. Tạo file environment

Tạo file `.env` trong thư mục `fe/`:

```env
VITE_API_BASE_URL=http://localhost:1574/api
VITE_APP_NAME=Financial Management
```

### 2. Chạy ứng dụng

```bash
cd fe
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5174**

### 3. Kết nối với Backend

Đảm bảo backend NestJS đang chạy tại `http://localhost:8000/api`.

## 📁 Cấu trúc đã tạo

```
fe/src/
├── api/                  # API services
│   ├── accounts.ts      # Account API
│   ├── transactions.ts  # Transaction API
│   ├── axiosInstance.ts # Axios config
│   └── types/           # TypeScript types
├── components/           # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Loading.tsx
│   └── Navigation.tsx
├── config/              # Configuration
│   ├── env.ts          # Environment variables
│   └── constants.ts    # App constants
├── hooks/              # Custom hooks
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── TransactionsPage.tsx
│   ├── AccountsPage.tsx
│   ├── CategoriesPage.tsx
│   └── GoalsPage.tsx
├── router/             # Router configuration
│   └── index.tsx
└── utils/              # Helper functions
    ├── formatters.ts
    └── validators.ts
```

## 🎨 Features

### Components

- **Button**: Button component với variants và sizes
- **Card**: Card container với title
- **Loading**: Loading spinner
- **Navigation**: Navigation bar với routing

### Pages

- **HomePage**: Dashboard tổng quan
- **TransactionsPage**: Quản lý giao dịch
- **AccountsPage**: Quản lý tài khoản
- **CategoriesPage**: Quản lý danh mục
- **GoalsPage**: Quản lý mục tiêu

### API Layer

- Axios instance với interceptors
- Request/Response interceptors
- Auto token injection
- Error handling

### Utilities

- **formatters**: formatCurrency, formatDate, formatNumber
- **validators**: isValidEmail, isValidPhone, isNotEmpty

### Hooks

- **useDebounce**: Debounce cho search input
- **useLocalStorage**: Quản lý localStorage

## 🎯 Sử dụng

### Import components

```typescript
import { Button, Card } from '@/components';
import { HomePage } from '@/pages';
```

### Gọi API

```typescript
import { getTransactions } from '@/api';

const transactions = await getTransactions(1, 10);
```

### Sử dụng utilities

```typescript
import { formatCurrency } from '@/utils';

const formatted = formatCurrency(1000000); // "1,000,000 VNĐ"
```

### Sử dụng hooks

```typescript
import { useDebounce } from '@/hooks';

const debouncedValue = useDebounce(searchValue, 500);
```

## 🔧 Scripts

```bash
npm run dev      # Development server
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📝 Notes

- Tất cả component đã có TypeScript type definitions
- TailwindCSS đã được config và ready to use
- Axios đã được setup với interceptors
- React Router đã được config với các routes cơ bản
- Environment config đã được setup
- Code không có lỗi linting

## 🎉 Ready to develop!

Project đã sẵn sàng để phát triển. Bạn có thể bắt đầu implement các features chi tiết cho từng module.
