import React, { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../redux/features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router';
import { RoleBadge } from './RoleBadge';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    dispatch(logout());
    void navigate('/login');
  };

  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/products')) return 'Products Inventory';
    if (path.startsWith('/sales/create')) return 'Create Sale';
    if (path.startsWith('/sales/history')) return 'Sales History';
    if (path.startsWith('/users')) return 'User Management';
    return 'ERP System';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      {/* Mobile Trigger & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 md:text-xl tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* User profile & actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
            <div className="hidden md:flex md:flex-col md:items-end">
              <span className="text-sm font-medium text-slate-700 leading-none mb-1">
                {user.name}
              </span>
              <RoleBadge role={user.role} />
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-sm font-semibold text-blue-600">
              {getInitials(user.name)}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-1.5 rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        description="Are you sure you want to sign out of ClassyERP? You will need to log back in to access dashboard analytics and inventory tools."
        confirmText="Log Out"
        isDestructive={true}
      />
    </header>
  );
};
