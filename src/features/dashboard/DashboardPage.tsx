import React from 'react';
import { useGetDashboardStatsQuery } from './dashboardApi';
import { StatCard } from '../../components/shared/StatCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { LowStockTable } from './LowStockTable';
import { Package, ShoppingCart, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-xs"
          >
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-7 bg-slate-200 rounded w-1/2" />
            </div>
            <div className="h-12 w-12 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="bg-white border border-slate-200 rounded-xl h-64" />
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetDashboardStatsQuery();

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
    <div className="space-y-8">
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
