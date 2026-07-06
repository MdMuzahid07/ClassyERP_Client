import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import { Login } from '../pages/Login';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { RoleGuard } from '../features/auth/RoleGuard';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { CreateSale } from '../pages/CreateSale';
import { SalesHistory } from '../pages/SalesHistory';
import { Users } from '../pages/Users';
import { NotFound } from '../pages/NotFound';
import { useAppSelector } from '../app/hooks';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const AppRoutes: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);

  React.useEffect(() => {
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routing wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Index landing redirection */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Protected Child Pages */}
          <Route
            path="dashboard"
            element={
              <RoleGuard requiredPermission="dashboard:read">
                <Dashboard />
              </RoleGuard>
            }
          />

          <Route
            path="products"
            element={
              <RoleGuard requiredPermission="product:read">
                <Products />
              </RoleGuard>
            }
          />

          <Route
            path="sales/create"
            element={
              <RoleGuard requiredPermission="sale:create">
                <CreateSale />
              </RoleGuard>
            }
          />

          <Route
            path="sales/history"
            element={
              <RoleGuard requiredPermission="sale:read">
                <SalesHistory />
              </RoleGuard>
            }
          />

          <Route
            path="users"
            element={
              <RoleGuard requiredPermission="user:manage">
                <Users />
              </RoleGuard>
            }
          />

          {/* Unmatched inside AppShell displays NotFound */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
