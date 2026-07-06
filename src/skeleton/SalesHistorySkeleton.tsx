import React from 'react';

export const SalesHistorySkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 bg-slate-200 rounded w-48" />
        <div className="h-4 bg-slate-200 rounded w-96" />
      </div>

      {/* Table Mock Skeleton */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-32" />
                </th>
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                </th>
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-40" />
                </th>
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </th>
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                </th>
                <th className="px-6 py-4 text-right w-24">
                  <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-40" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-8 w-8 bg-slate-200 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SalesHistorySkeleton;
