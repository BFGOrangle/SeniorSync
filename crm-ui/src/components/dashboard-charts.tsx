'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  StatusDistribution,
  PriorityDistribution,
  RequestTypeSummary,
  MonthlyTrend,
  StaffWorkload,
} from '@/types/dashboard';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

function ChartCard({ title, children, className, loading }: ChartCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// Monthly Trend Chart using Recharts
interface MonthlyTrendChartProps {
  data: MonthlyTrend | null;
  loading?: boolean;
}

export function MonthlyTrendChart({ data, loading }: MonthlyTrendChartProps) {
  const chartData = data ? Object.entries(data).map(([month, count]) => ({
    date: month,
    value: count
  })) : [];

  return (
    <ChartCard title="Monthly Request Trends" loading={loading}>
      {data && (
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.date}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Requests
                            </span>
                            <span className="font-bold">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                fill="url(#gradientArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

// Simple bar chart using CSS
interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue?: number;
  horizontal?: boolean;
}

function SimpleBarChart({ data, maxValue, horizontal = false }: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  if (horizontal) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  item.color || 'bg-primary'
                )}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                item.color || 'bg-primary'
              )}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Status Distribution Chart
interface StatusDistributionChartProps {
  data: StatusDistribution | null;
  loading?: boolean;
}

export function StatusDistributionChart({ data, loading }: StatusDistributionChartProps) {
  const chartData = data ? Object.entries(data).map(([status, count]) => ({
    label: status,
    value: count,
    color: status === 'Pending' ? 'bg-yellow-500' : 
           status === 'In Progress' ? 'bg-blue-500' : 
           status === 'Completed' ? 'bg-green-500' : 'bg-gray-400'
  })) : [];

  return (
    <ChartCard title="Request Status Distribution" loading={loading}>
      {data && (
        <SimpleBarChart 
          data={chartData}
          horizontal={true}
        />
      )}
    </ChartCard>
  );
}

// Priority Distribution Chart
interface PriorityDistributionChartProps {
  data: PriorityDistribution | null;
  loading?: boolean;
}

export function PriorityDistributionChart({ data, loading }: PriorityDistributionChartProps) {
  const chartData = data ? Object.entries(data).map(([priority, count]) => ({
    label: priority,
    value: count,
    color: priority === 'High' ? 'bg-red-500' :
           priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
  })) : [];

  return (
    <ChartCard title="Priority Distribution" loading={loading}>
      {data && (
        <SimpleBarChart 
          data={chartData}
          horizontal={true}
        />
      )}
    </ChartCard>
  );
}

// Request Types Chart
interface RequestTypesChartProps {
  data: RequestTypeSummary[];
  loading?: boolean;
}

export function RequestTypesChart({ data, loading }: RequestTypesChartProps) {
  const chartData = data.slice(0, 6).map((item) => ({
    label: item.name,
    value: item.count,
    color: 'bg-primary'
  }));

  return (
    <ChartCard title="Top Request Categories" loading={loading}>
      {data.length > 0 && (
        <SimpleBarChart data={chartData} />
      )}
    </ChartCard>
  );
}

// Staff Workload Chart
interface StaffWorkloadChartProps {
  data: StaffWorkload | null;
  loading?: boolean;
}

export function StaffWorkloadChart({ data, loading }: StaffWorkloadChartProps) {
  const chartData = data ? Object.entries(data)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map((item) => ({
      label: item[0],
      value: item[1],
      color: 'bg-primary'
    })) : [];

  return (
    <ChartCard title="Staff Workload Distribution" loading={loading}>
      {data && (
        <SimpleBarChart data={chartData} />
      )}
    </ChartCard>
  );
}

// Request Type Details Table
interface RequestTypeDetailsProps {
  data: RequestTypeSummary[];
  loading?: boolean;
}

export function RequestTypeDetails({ data, loading }: RequestTypeDetailsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Request Categories Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((type, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{type.name}</span>
                  <Badge variant="secondary">{type.count} requests</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-muted-foreground">Pending: {type.pendingCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">In Progress: {type.inProgressCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Completed: {type.completedCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 