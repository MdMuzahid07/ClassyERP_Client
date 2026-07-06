import React from 'react';

export const UsersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-48" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-96" />
      </div>

      {/* Filter / Actions Bar Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex w-full max-w-md gap-2">
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
        </div>
      </div>

      {/* Table Mock Skeleton */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                </th>
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36" />
                </th>
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                </th>
                <th className="px-6 py-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                </th>
                <th className="px-6 py-4 text-right w-36">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
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
export default UsersSkeleton;
