import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { HomePage } from '../pages/HomePage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { AddTransactionPage } from '../pages/AddTransactionPage';
import { AccountsPage } from '../pages/AccountsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { GoalsPage } from '../pages/GoalsPage';
import { SignUpPage } from '../pages/SignUpPage';
import { LoginPage } from '../pages/LoginPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/new" element={<AddTransactionPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
