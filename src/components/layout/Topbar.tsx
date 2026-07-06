import React from 'react';
import { useLocation } from 'react-router';
import { useAppSelector } from '../../app/hooks';
import { RoleBadge } from './RoleBadge';
import { SidebarTrigger } from '../ui/sidebar';

export const Topbar: React.FC = () => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 shadow-sm md:px-6">
      {/* Sidebar Trigger & Title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="cursor-pointer text-foreground" />
        <h1 className="text-lg font-semibold text-foreground md:text-xl tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* User Profile Card (Topbar Right) */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex md:flex-col md:items-end">
              <span className="text-sm font-medium text-foreground leading-none mb-1">
                {user.name}
              </span>
              <RoleBadge role={user.role} />
            </div>
            {/* Avatar Circle */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-xs">
              {getInitials(user.name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Topbar;
