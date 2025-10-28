# Financial Management - Frontend

Ứng dụng quản lý tài chính cá nhân được xây dựng với React + TypeScript + TailwindCSS.

## 🚀 Công nghệ sử dụng

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP Client

## 📁 Cấu trúc thư mục

```
fe/
├── src/
│   ├── api/              # API services & axios instance
│   ├── assets/           # Hình ảnh, icons
│   ├── components/       # Component tái sử dụng
│   ├── config/           # Cấu hình (env, constants)
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Các trang chính
│   ├── router/           # Định nghĩa routes
│   ├── utils/            # Helper functions
│   ├── App.tsx
│   └── main.tsx
├── public/               # Static files
└── package.json
```

## 🛠️ Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` (copy từ `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Financial Management
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 4. Build production

```bash
npm run build
```

## 📝 Tính năng

- ✅ Trang chủ với dashboard tổng quan
- ✅ Quản lý giao dịch (thu nhập/chi tiêu)
- ✅ Quản lý tài khoản
- ✅ Quản lý danh mục
- ✅ Quản lý mục tiêu tài chính
- ✅ Giao diện responsive với TailwindCSS

## 🎨 Component Library

### Button

```tsx
<Button variant="primary" size="md">Submit</Button>
```

Variants: `primary`, `secondary`, `danger`  
Sizes: `sm`, `md`, `lg`

### Card

```tsx
<Card title="Title">Content here</Card>
```

### Loading

```tsx
<Loading text="Đang tải..." />
```

## 🌐 API Integration

Tất cả API calls được thực hiện qua `axiosInstance` trong `src/api/`.

### Example:

```typescript
import { getTransactions } from './api/transactions';

const transactions = await getTransactions(1, 10);
```

## 📚 Development

### Code Convention

- Component: PascalCase
- File: kebab-case (trừ React component)
- Function: camelCase
- Constant: UPPER_SNAKE_CASE

### Best Practices

- Luôn xử lý loading và error states
- Không gọi API trực tiếp trong component (dùng service layer)
- Dùng TypeScript cho type safety
- Responsive design với TailwindCSS

## 🔗 Liên kết

- Backend API: `http://localhost:3000/api`
- Frontend Dev: `http://localhost:5173`