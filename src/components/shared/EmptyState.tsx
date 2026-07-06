import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  iconBg = 'bg-muted',
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card text-foreground space-y-3">
      <div className={`p-4 rounded-full ${iconBg} ${iconColor}`}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-normal">{description}</p>
      </div>
    </div>
  );
};
export default EmptyState;
