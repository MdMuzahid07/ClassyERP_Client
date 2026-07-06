import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileDrawer';

export const AppShell: React.FC = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Desktop Sidebar (fixed left) */}
      <Sidebar />

      {/* Mobile Drawer (backdrop-overlay, slide-in) */}
      <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />

      {/* Main Content Frame */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header */}
        <Topbar onMenuClick={() => setIsMobileDrawerOpen(true)} />

        {/* Dynamic Inner Views */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AppShell;
