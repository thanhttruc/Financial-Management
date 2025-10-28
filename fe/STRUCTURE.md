# 📁 Cấu trúc Project Frontend

## Directory Structure

```
fe/
├── src/
│   ├── api/                     # 🔌 API Layer
│   │   ├── accounts.ts          # Account API service
│   │   ├── transactions.ts      # Transaction API service  
│   │   ├── axiosInstance.ts     # Axios config & interceptors
│   │   ├── types/               # API types
│   │   │   └── index.ts
│   │   └── index.ts             # Export all APIs
│   │
│   ├── components/              # 🧩 Reusable Components
│   │   ├── Button.tsx           # Button component
│   │   ├── Card.tsx             # Card component
│   │   ├── Loading.tsx          # Loading component
│   │   ├── Navigation.tsx       # Navigation bar
│   │   └── index.ts             # Export all components
│   │
│   ├── config/                  # ⚙️ Configuration
│   │   ├── env.ts              # Environment variables
│   │   ├── constants.ts        # App constants
│   │   └── index.ts            # Export configs
│   │
│   ├── hooks/                   # 🎣 Custom Hooks
│   │   ├── useDebounce.ts      # Debounce hook
│   │   ├── useLocalStorage.ts  # LocalStorage hook
│   │   └── index.ts            # Export all hooks
│   │
│   ├── pages/                   # 📄 Page Components
│   │   ├── HomePage.tsx        # Dashboard
│   │   ├── TransactionsPage.tsx # Transactions
│   │   ├── AccountsPage.tsx    # Accounts
│   │   ├── CategoriesPage.tsx  # Categories
│   │   ├── GoalsPage.tsx       # Goals
│   │   └── index.ts            # Export all pages
│   │
│   ├── router/                  # 🔀 Router Setup
│   │   └── index.tsx           # Router config
│   │
│   ├── utils/                   # 🔧 Utilities
│   │   ├── formatters.ts       # Format functions
│   │   ├── validators.ts       # Validator functions
│   │   └── index.ts           # Export all utils
│   │
│   ├── assets/                  # 📦 Assets
│   │   └── react.svg
│   │
│   ├── App.tsx                  # 🎯 Main App
│   ├── main.tsx                 # 🔌 Entry point
│   └── index.css               # 🎨 Global styles (Tailwind)
│
├── public/                      # 📁 Public files
│   └── vite.svg
│
├── .gitignore                   # Git ignore
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── README.md                    # 📚 Documentation
├── SETUP_GUIDE.md              # 🚀 Setup guide
├── PROJECT_SUMMARY.md          # 📊 Project summary
├── STRUCTURE.md                 # 📁 This file
├── tailwind.config.js          # TailwindCSS config
├── postcss.config.js           # PostCSS config
├── tsconfig.json               # TypeScript config
├── tsconfig.app.json           # TypeScript app config
├── tsconfig.node.json          # TypeScript node config
└── vite.config.ts              # Vite config

```

## 📦 Module Details

### API Layer (`src/api/`)
- **axiosInstance.ts**: Axios config với interceptors
- **accounts.ts**: Account CRUD API
- **transactions.ts**: Transaction CRUD API
- **types/index.ts**: TypeScript types

### Components (`src/components/`)
- **Button**: Button với variants (primary/secondary/danger) và sizes (sm/md/lg)
- **Card**: Card container với title optional
- **Loading**: Loading spinner với text
- **Navigation**: Navigation bar với active state

### Config (`src/config/`)
- **env.ts**: Environment variables (API_URL, APP_NAME)
- **constants.ts**: App constants (types, sizes, keys)

### Hooks (`src/hooks/`)
- **useDebounce**: Debounce values cho search
- **useLocalStorage**: Quản lý localStorage dễ dàng

### Pages (`src/pages/`)
- **HomePage**: Dashboard với stats cards
- **TransactionsPage**: Danh sách giao dịch
- **AccountsPage**: Danh sách tài khoản
- **CategoriesPage**: Danh sách danh mục
- **GoalsPage**: Danh sách mục tiêu

### Router (`src/router/`)
- React Router setup với 5 routes
- Layout với Navigation component

### Utils (`src/utils/`)
- **formatters**: formatCurrency, formatDate, formatNumber
- **validators**: isValidEmail, isValidPhone, isNotEmpty

## 🎯 Import Paths

Sử dụng path alias `@/` để import:

```typescript
import { Button } from '@/components';
import { HomePage } from '@/pages';
import { getTransactions } from '@/api';
import { formatCurrency } from '@/utils';
import { useDebounce } from '@/hooks';
import { ENV } from '@/config';
```

## 📊 File Count

- **API Services**: 3 files
- **Components**: 4 files
- **Pages**: 5 files
- **Hooks**: 2 files
- **Utils**: 2 files
- **Config**: 2 files
- **Router**: 1 file
- **Total**: ~20 source files

## ✅ Features

✅ TailwindCSS styling
✅ TypeScript type safety
✅ React Router routing
✅ Axios API integration
✅ Custom hooks
✅ Utility functions
✅ Path aliases
✅ Responsive design
✅ No state management (as requested)
