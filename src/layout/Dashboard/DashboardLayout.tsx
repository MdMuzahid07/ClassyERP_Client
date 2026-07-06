import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/features/auth/authSlice';
import { useTheme } from '../../hooks/useTheme';

export const DashboardLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    void navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Layout */}
      <aside className="w-full md:w-64 bg-card border-r border-border p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <img src="/classy-logo.png" alt="ClassyERP Logo" className="h-8" />
            <span className="font-bold text-lg">ClassyERP</span>
          </div>

          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="block px-4 py-2 rounded hover:bg-muted transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/products"
              className="block px-4 py-2 rounded hover:bg-muted transition-colors"
            >
              Products
            </Link>
            <Link
              to="/dashboard/sales/create"
              className="block px-4 py-2 rounded hover:bg-muted transition-colors"
            >
              Create Sale
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-4 space-y-4">
          {user && (
            <div className="px-4">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
            </div>
          )}

          <div className="flex items-center justify-between px-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded bg-muted hover:bg-border transition-colors text-xs font-semibold cursor-pointer"
            >
              Toggle Mode ({theme === 'light' ? 'Dark' : 'Light'})
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
export default DashboardLayout;
