import {
  History,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { hasPermission, type Permission } from '../../lib/permissions';
import { logout } from '../../redux/features/auth/authSlice';
import { ClassyLogo } from '../shared/ClassyLogo';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useTheme } from '../theme/theme-provider';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';

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

interface SidebarContentProps {
  onItemClick?: () => void;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({ onItemClick }) => {
  const location = useLocation();
  const { state } = useSidebar();
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!role) return false;
    return hasPermission(role, item.permission);
  });

  const isCollapsed = state === 'collapsed';

  return (
    <ShadcnSidebarContent
      className={`py-6 transition-all duration-200 ${isCollapsed ? 'px-2' : 'px-4'}`}
    >
      <SidebarMenu className="space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                render={<NavLink to={item.path} onClick={onItemClick} />}
                isActive={isActive}
                tooltip={isCollapsed ? item.name : undefined}
                className={`transition-all duration-200 rounded-lg relative w-full flex items-center ${
                  isActive
                    ? 'bg-sidebar-primary/10 text-sidebar-primary font-semibold hover:bg-sidebar-primary/15'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                {/* Left active line indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 h-1/2 w-1 bg-sidebar-primary rounded-r" />
                )}
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-sidebar-primary'
                      : 'text-sidebar-foreground/60 group-hover/menu-button:text-sidebar-foreground'
                  }`}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </ShadcnSidebarContent>
  );
};

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    dispatch(logout());
    void navigate('/login');
  };

  const isCollapsed = state === 'collapsed';

  return (
    <>
      <ShadcnSidebar collapsible="icon">
        {/* Brand Header */}
        <SidebarHeader
          className={`flex h-16 flex-row items-center border-b border-sidebar-border transition-all duration-200 ${
            isCollapsed ? 'px-2 justify-center' : 'px-6 justify-between'
          }`}
        >
          <ClassyLogo className="h-10 transition-all" iconOnly={isCollapsed} />
        </SidebarHeader>

        {/* Navigation Content */}
        <SidebarContent />

        {/* Footer Actions */}
        <SidebarFooter
          className={`flex flex-col gap-3 pb-4  transition-all duration-200 ${
            isCollapsed ? 'items-center px-1' : 'p-4'
          }`}
        >
          {/* Theme Switcher */}
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-sidebar-border bg-white dark:bg-slate-950/40 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          ) : (
            <div className="flex p-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-950/40 border border-slate-300/40 dark:border-sidebar-border/20 mb-4">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  theme !== 'dark'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs'
                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs'
                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
            </div>
          )}

          {/* Logout Action */}
          <div className="w-full flex justify-center border-t border-sidebar-border/50 pt-4">
            {isCollapsed ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent hover:border-red-200/60 dark:hover:border-transparent text-sidebar-foreground/75 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-transparent hover:border-red-200/40 dark:hover:border-transparent text-sidebar-foreground/75 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer text-left"
                title="Log out"
              >
                <LogOut className="mr-3 h-4 w-4 flex-shrink-0 text-sidebar-foreground/60 group-hover:text-red-600 transition-colors" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </SidebarFooter>
      </ShadcnSidebar>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        description="Are you sure you want to sign out of ClassyERP? You will need to log back in to access dashboard analytics and inventory tools."
        confirmText="Log Out"
        isDestructive={true}
      />
    </>
  );
};
