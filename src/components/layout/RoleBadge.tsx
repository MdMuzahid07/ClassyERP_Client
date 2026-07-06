import React from 'react';
import { type Role } from '../../types/user';

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  let colorClasses: string;
  switch (role) {
    case 'Admin':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'Manager':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'Employee':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    default:
      colorClasses = 'bg-slate-50 text-slate-700 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      {role}
    </span>
  );
};
