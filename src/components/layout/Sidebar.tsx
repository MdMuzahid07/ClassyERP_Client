import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, History, Users } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { hasPermission, type Permission } from '../../lib/permissions';

interface NavItem {
  name: string;
  path: string;
  permission: Permission;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', permission: 'dashboard:read', icon: LayoutDashboard },
  { name: 'Products', path: '/products', permission: 'product:read', icon: Package },
  { name: 'Create Sale', path: '/sales/create', permission: 'sale:create', icon: ShoppingCart },
  { name: 'Sale History', path: '/sales/history', permission: 'sale:read', icon: History },
  { name: 'Users', path: '/users', permission: 'user:manage', icon: Users },
];

import { ClassyLogo } from '../shared/ClassyLogo';

export const SidebarContent: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!role) return false;
    return hasPermission(role, item.permission);
  });

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <ClassyLogo className="h-8" lightText />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-blue-600/10 text-blue-500 font-semibold'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Left accent bar on active state */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 h-1/2 w-1 bg-blue-600 rounded-r" />
                )}
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800">
      <SidebarContent />
    </aside>
  );
};
