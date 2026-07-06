import React, { useEffect } from 'react';
import { useGetDashboardStatsQuery } from '../../redux/features/dashboard/dashboardApi';
import { StatCard } from '../../components/shared/StatCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { LowStockTable } from './LowStockTable';
import { Package, ShoppingCart, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getSocket } from '../../lib/socket';
import { useAppDispatch } from '../../app/hooks';
import { baseApi } from '../../redux/api/baseApi';
import { toast } from 'sonner';
import { DashboardSkeleton } from '../../skeleton/DashboardSkeleton';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = useGetDashboardStatsQuery();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleLowStockAlert = (payload: { name: string; stockQuantity: number }) => {
      toast.warning(
        `Low Stock Warning: ${payload.name} has only ${payload.stockQuantity} items left!`
      );
      dispatch(baseApi.util.invalidateTags(['Dashboard']));
    };

    const handleNewSale = () => {
      toast.info('New sale checkout completed!');
      dispatch(baseApi.util.invalidateTags(['Dashboard']));
    };

    socket.on('lowStockAlert', handleLowStockAlert);
    socket.on('newSale', handleNewSale);

    return () => {
      socket.off('lowStockAlert', handleLowStockAlert);
      socket.off('newSale', handleNewSale);
    };
  }, [dispatch]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-red-100 rounded-xl text-center space-y-4 shadow-xs">
        <div className="p-3 bg-red-50 text-red-600 rounded-full">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-800">Failed to Load Dashboard Stats</h3>
          <p className="text-xs text-slate-500">
            There was a problem communicating with the server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const { totalProducts = 0, totalSales = 0, lowStockProducts = [] } = data ?? {};

  return (
    <div className="space-y-8 animate-page-entrance">
      {/* 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Total Sales"
          value={totalSales}
          icon={ShoppingCart}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          iconColor={lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-400'}
          iconBg={lowStockProducts.length > 0 ? 'bg-amber-50' : 'bg-slate-50'}
        />
      </div>

      {/* Low Stock Alert Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Low Stock Alerts</h2>
        {lowStockProducts.length > 0 ? (
          <LowStockTable products={lowStockProducts} />
        ) : (
          <EmptyState
            title="All items healthy"
            description="No low stock products found. Your current inventory levels are healthy."
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        )}
      </div>
    </div>
  );
};
export default DashboardPage;
