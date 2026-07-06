import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { X } from 'lucide-react';
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
      <div
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content panel */}
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-slate-900 shadow-xl transition-transform duration-300">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-wide">
            Classy<span className="text-blue-500">ERP</span>
          </span>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
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
