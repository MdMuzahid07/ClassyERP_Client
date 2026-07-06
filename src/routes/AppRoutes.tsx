import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { DashboardLayout } from '../layout/Dashboard/DashboardLayout';
import { Login } from '../pages/Login';
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { Products } from '../pages/dashboard/Products';
import { CreateSale } from '../pages/dashboard/CreateSale';
import { NotFound } from '../pages/NotFound';
import { PrivateRoute } from '../auth/PrivateRoute';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Core Layout Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Default Route redirection */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Route */}
          <Route path="dashboard" element={<DashboardHome />} />

          {/* Product Module */}
          <Route path="products" element={<Products />} />

          {/* Sales Module */}
          <Route path="sales/create" element={<CreateSale />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
