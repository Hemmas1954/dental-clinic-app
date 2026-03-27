import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-text">{value}</h3>
          
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-2 flex items-center gap-1",
              trendUp ? "text-success" : "text-danger"
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-light/50 rounded-xl text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
