import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { ClassyLogo } from '../shared/ClassyLogo';
import { SidebarContent } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 transition-opacity" onClick={onClose} />

      {/* Drawer content panel */}
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-[var(--sidebar-background)] shadow-xl transition-transform duration-300">
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <ClassyLogo className="h-8" />
          <button
            type="button"
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarContent onItemClick={onClose} />
        </div>
      </div>
    </div>
  );
};
export default MobileDrawer;
