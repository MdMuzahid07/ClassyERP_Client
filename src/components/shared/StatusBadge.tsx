import React from 'react';

interface StatusBadgeProps {
  quantity: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ quantity }) => {
  let text: string;
  let colorClasses: string;

  if (quantity <= 2) {
    text = 'Critical';
    colorClasses =
      'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50';
  } else if (quantity < 5) {
    text = 'Low Stock';
    colorClasses =
      'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
  } else {
    text = 'Healthy';
    colorClasses =
      'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      {text} ({quantity})
    </span>
  );
};
export default StatusBadge;
