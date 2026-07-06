import React from 'react';

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
export default DashboardSkeleton;
