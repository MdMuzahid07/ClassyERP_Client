import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { RootLayout } from '../layouts/RootLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { CreateSalePage } from '../features/sales/pages/CreateSalePage';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Core Layout Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Route redirection */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Route */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Product Module - Employee, Manager, Admin can view */}
          <Route path="products" element={<ProductsPage />} />

          {/* Sales Module - Employee, Manager, Admin can create sales */}
          <Route path="sales/create" element={<CreateSalePage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
