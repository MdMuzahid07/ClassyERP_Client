import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';

export const AppShell: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex w-full">
        {/* Desktop & Mobile Sidebar from Shadcn */}
        <Sidebar />

        {/* Main Content Frame */}
        <SidebarInset className="flex flex-col min-h-screen flex-grow">
          {/* Top Header */}
          <Topbar />

          {/* Dynamic Inner Views */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background text-foreground overflow-y-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
export default AppShell;
