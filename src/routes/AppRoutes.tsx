import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { RoleGuard } from '../features/auth/RoleGuard';

const DashboardPlaceholder = () => (
  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
    <h2 className="text-xl font-semibold mb-2">Dashboard Analytics</h2>
    <p className="text-slate-600 text-sm">Dashboard content will be configured in Phase 3.</p>
  </div>
);

const ProductsPlaceholder = () => (
  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
    <h2 className="text-xl font-semibold mb-2">Products Inventory</h2>
    <p className="text-slate-600 text-sm">
      Products management table will be configured in Phase 4.
    </p>
  </div>
);

const CreateSalePlaceholder = () => (
  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
    <h2 className="text-xl font-semibold mb-2">Create Sale</h2>
    <p className="text-slate-600 text-sm">Create sale terminal will be configured in Phase 5.</p>
  </div>
);

const SalesHistoryPlaceholder = () => (
  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
    <h2 className="text-xl font-semibold mb-2">Sales History</h2>
    <p className="text-slate-600 text-sm">Sales ledger history will be configured in Phase 6.</p>
  </div>
);

const UsersPlaceholder = () => (
  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
    <h2 className="text-xl font-semibold mb-2">User Management</h2>
    <p className="text-slate-600 text-sm">
      Administrative user tables will be configured in Phase 7.
    </p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

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
                <DashboardPlaceholder />
              </RoleGuard>
            }
          />

          <Route
            path="products"
            element={
              <RoleGuard requiredPermission="product:read">
                <ProductsPlaceholder />
              </RoleGuard>
            }
          />

          <Route
            path="sales/create"
            element={
              <RoleGuard requiredPermission="sale:create">
                <CreateSalePlaceholder />
              </RoleGuard>
            }
          />

          <Route
            path="sales/history"
            element={
              <RoleGuard requiredPermission="sale:read">
                <SalesHistoryPlaceholder />
              </RoleGuard>
            }
          />

          <Route
            path="users"
            element={
              <RoleGuard requiredPermission="user:manage">
                <UsersPlaceholder />
              </RoleGuard>
            }
          />
        </Route>

        {/* Wildcard redirects back to index */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRoutes;
