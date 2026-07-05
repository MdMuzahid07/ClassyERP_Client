import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { PrivateRoute } from '../auth/PrivateRoute';
import { DashboardLayout } from '../layout/Dashboard/DashboardLayout';
import { Login } from '../pages/Login';
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { Products } from '../pages/dashboard/Products';
import { CreateSale } from '../pages/dashboard/CreateSale';
import { NotFound } from '../pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Default dashboard path */}
          <Route index element={<DashboardHome />} />
          
          <Route path="products" element={<Products />} />
          <Route path="sales/create" element={<CreateSale />} />
        </Route>

        {/* Root path redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
