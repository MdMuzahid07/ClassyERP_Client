import React from 'react';

interface StatusBadgeProps {
  quantity: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ quantity }) => {
  let text: string;
  let colorClasses: string;

  if (quantity <= 2) {
    text = 'Critical';
    colorClasses = 'bg-red-50 text-red-700 border-red-200';
  } else if (quantity < 5) {
    text = 'Low Stock';
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    text = 'Healthy';
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
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
