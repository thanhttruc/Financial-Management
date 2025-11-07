import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { HomePage } from '../pages/HomePage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { AccountsPage } from '../pages/AccountsPage';
import { AccountDetails } from '../components/AccountDetails';
import { CategoriesPage } from '../pages/CategoriesPage';
import { GoalsPage } from '../pages/GoalsPage';
import { BillsPage } from '../pages/BillsPage';
import { ExpensesPage } from '../pages/ExpensesPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NewTransactionForm } from '../components/NewTransactionForm';

// Layout component cho các trang có Navigation
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {children}
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/transactions"
          element={
            <Layout>
              <TransactionsPage />
            </Layout>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <Layout>
              <NewTransactionForm />
            </Layout>
          }
        />
        <Route
          path="/accounts"
          element={
            <Layout>
              <AccountsPage />
            </Layout>
          }
        />
        <Route
          path="/accounts/:id"
          element={
            <Layout>
              <AccountDetails />
            </Layout>
          }
        />
        <Route
          path="/categories"
          element={
            <Layout>
              <CategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/bills"
          element={
            <Layout>
              <BillsPage />
            </Layout>
          }
        />
        <Route
          path="/expenses"
          element={
            <Layout>
              <ExpensesPage />
            </Layout>
          }
        />
        <Route
          path="/goals"
          element={
            <Layout>
              <GoalsPage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
