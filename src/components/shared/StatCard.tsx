import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600 dark:text-blue-400',
  iconBg = 'bg-blue-50 dark:bg-blue-950/20',
}) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex items-center justify-between text-foreground">
      <div className="space-y-1">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${iconBg} ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
};
export default StatCard;
