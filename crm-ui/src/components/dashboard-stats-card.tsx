'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
  loading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'border-border',
  success: 'border-green-200 bg-green-50/50',
  warning: 'border-yellow-200 bg-yellow-50/50',
  error: 'border-red-200 bg-red-50/50',
};

const iconMapping = {
  users: Users,
  requests: ClipboardList,
  completed: CheckCircle,
  pending: Clock,
  urgent: AlertTriangle,
};

export function DashboardStatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  loading = false,
  variant = 'default',
}: DashboardStatsCardProps) {
  if (loading) {
    return (
      <Card className={cn('h-[140px]', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend?.isPositive ? TrendingUp : trend?.isPositive === false ? TrendingDown : Minus;

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {trend && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs',
                trend.isPositive 
                  ? 'text-green-700 bg-green-100' 
                  : trend.isPositive === false 
                    ? 'text-red-700 bg-red-100'
                    : 'text-gray-700 bg-gray-100'
              )}
            >
              <TrendIcon className="h-3 w-3 mr-1" />
              {Math.abs(trend.value)}% {trend.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Predefined stat card components for common use cases
export function TotalRequestsCard({ value, loading, trend }: Pick<DashboardStatsCardProps, 'value' | 'loading' | 'trend'>) {
  return (
    <DashboardStatsCard
      title="Total Requests"
      value={value}
      icon={<ClipboardList className="h-4 w-4" />}
      description="All time requests"
      trend={trend}
      loading={loading}
    />
  );
}

export function PendingRequestsCard({ value, loading, trend }: Pick<DashboardStatsCardProps, 'value' | 'loading' | 'trend'>) {
  return (
    <DashboardStatsCard
      title="Pending Requests"
      value={value}
      icon={<Clock className="h-4 w-4" />}
      description="Awaiting action"
      trend={trend}
      loading={loading}
      variant="warning"
    />
  );
}

export function CompletedThisMonthCard({ value, loading, trend }: Pick<DashboardStatsCardProps, 'value' | 'loading' | 'trend'>) {
  return (
    <DashboardStatsCard
      title="Completed This Month"
      value={value}
      icon={<CheckCircle className="h-4 w-4" />}
      description="This month"
      trend={trend}
      loading={loading}
      variant="success"
    />
  );
}

export function AverageCompletionTimeCard({ value, loading, trend }: Pick<DashboardStatsCardProps, 'value' | 'loading' | 'trend'>) {
  const formattedValue = typeof value === 'number' ? `${value.toFixed(1)} days` : value;
  
  return (
    <DashboardStatsCard
      title="Avg. Completion Time"
      value={formattedValue}
      icon={<TrendingUp className="h-4 w-4" />}
      description="Average resolution"
      trend={trend}
      loading={loading}
    />
  );
} 