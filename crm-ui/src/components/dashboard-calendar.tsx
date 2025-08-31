"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  AlertTriangle 
} from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  isValid
} from 'date-fns';
import { cn } from '@/lib/utils';
import { SeniorRequestDisplayView } from '@/types/request';

interface TaskCountData {
  date: Date;
  count: number;
  overdue: number;
  dueToday: number;
  tasks: SeniorRequestDisplayView[];
}

interface DashboardCalendarProps {
  requests?: SeniorRequestDisplayView[];
  onDateClick?: (date: Date, tasks: SeniorRequestDisplayView[]) => void;
  className?: string;
  mode?: 'personal' | 'center'; // Add mode prop
}

export function DashboardCalendar({ 
  requests = [], 
  onDateClick,
  className,
  mode = 'center'
}: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'chart'>('calendar');

  // Process requests to get task counts by date
  const taskCountsByDate = useMemo(() => {
    const counts = new Map<string, TaskCountData>();
    const today = new Date();
    
    requests.forEach(request => {
      if (!request.dueDate) return;
      
      try {
        const dueDate = parseISO(request.dueDate);
        if (!isValid(dueDate)) return;
        
        const dateKey = format(dueDate, 'yyyy-MM-dd');
        const existing = counts.get(dateKey) || {
          date: dueDate,
          count: 0,
          overdue: 0,
          dueToday: 0,
          tasks: []
        };
        
        existing.count += 1;
        existing.tasks.push(request);
        
        // Check if overdue or due today
        if (dueDate < today && !isSameDay(dueDate, today)) {
          existing.overdue += 1;
        } else if (isSameDay(dueDate, today)) {
          existing.dueToday += 1;
        }
        
        counts.set(dateKey, existing);
      } catch (error) {
        console.warn('Invalid due date:', request.dueDate);
      }
    });
    
    return counts;
  }, [requests]);

  // Get calendar days for the current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get task count for a specific date
  const getTaskCountForDate = (date: Date): TaskCountData => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return taskCountsByDate.get(dateKey) || {
      date,
      count: 0,
      overdue: 0,
      dueToday: 0,
      tasks: []
    };
  };

  // Get color intensity based on task count
  const getIntensityColor = (count: number, overdue: number): string => {
    if (overdue > 0) {
      return 'bg-red-100 border-red-300 text-red-800';
    } else if (count >= 5) {
      return 'bg-blue-100 border-blue-300 text-blue-800';
    } else if (count >= 3) {
      return 'bg-blue-50 border-blue-200 text-blue-700';
    } else if (count >= 1) {
      return 'bg-blue-25 border-blue-100 text-blue-600';
    }
    return 'bg-gray-50 border-gray-200 text-gray-500';
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    const taskData = getTaskCountForDate(date);
    if (taskData.count > 0 && onDateClick) {
      onDateClick(date, taskData.tasks);
    }
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get monthly statistics
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    let totalTasks = 0;
    let overdueTasks = 0;
    let todayTasks = 0;
    let maxDayCount = 0;
    
    taskCountsByDate.forEach((data, dateKey) => {
      const date = data.date;
      if (date >= monthStart && date <= monthEnd) {
        totalTasks += data.count;
        overdueTasks += data.overdue;
        todayTasks += data.dueToday;
        maxDayCount = Math.max(maxDayCount, data.count);
      }
    });
    
    return {
      totalTasks,
      overdueTasks,
      todayTasks,
      maxDayCount,
      averagePerDay: totalTasks > 0 ? (totalTasks / calendarDays.filter(day => isSameMonth(day, currentDate)).length).toFixed(1) : '0'
    };
  }, [taskCountsByDate, currentDate, calendarDays]);

  // Calendar View Component
  const CalendarView = () => (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs"
          >
            Today
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const taskData = getTaskCountForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={cn(
                "relative h-16 p-1 border rounded-lg transition-all duration-200 hover:shadow-sm",
                isCurrentMonth ? "opacity-100" : "opacity-40",
                isDayToday && "ring-2 ring-blue-500",
                taskData.count > 0 ? "cursor-pointer hover:scale-105" : "cursor-default",
                getIntensityColor(taskData.count, taskData.overdue)
              )}
            >
              <div className="absolute top-1 left-1 text-sm font-medium">
                {format(day, 'd')}
              </div>
              
              {taskData.count > 0 && (
                <div className="absolute bottom-1 right-1">
                  <Badge 
                    variant={"destructive"}
                    className="text-xs px-1.5 py-0.5"
                  >
                    Requests due: {taskData.count}
                  </Badge>
                </div>
              )}
              
              {taskData.overdue > 0 && (
                <div className="absolute top-1 right-1">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 pt-2 border-t">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-25 border border-blue-100 rounded"></div>
          <span>1-2 requests</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
          <span>3-4 requests</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>5+ requests</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>Overdue</span>
        </div>
      </div>
    </div>
  );

  // Chart View Component (simplified monthly overview)
  const ChartView = () => {
    const monthlyData = useMemo(() => {
      const data: { month: string; tasks: number; overdue: number }[] = [];
      
      for (let i = -5; i <= 1; i++) {
        const month = addMonths(new Date(), i);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        let tasks = 0;
        let overdue = 0;
        
        taskCountsByDate.forEach((taskData) => {
          if (taskData.date >= monthStart && taskData.date <= monthEnd) {
            tasks += taskData.count;
            overdue += taskData.overdue;
          }
        });
        
        data.push({
          month: format(month, 'MMM yyyy'),
          tasks,
          overdue
        });
      }
      
      return data;
    }, [taskCountsByDate]);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">6-Month Overview</h3>
        <div className="space-y-2">
          {monthlyData.map((data, index) => (
            <div key={data.month} className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">{data.month}</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (data.tasks / Math.max(...monthlyData.map(d => d.tasks), 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{data.tasks} tasks</span>
                </div>
                {data.overdue > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {data.overdue} overdue
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>{mode === 'personal' ? 'My Requests Due Date Calendar' : 'Requests Due Date Calendar'}</span>
          </CardTitle>
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'chart')}>
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="chart">Overview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Monthly Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalTasks}</div>
            <div className="text-sm text-gray-600">
              {mode === 'personal' ? 'My Tasks' : 'Total Tasks'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{monthlyStats.overdueTasks}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{monthlyStats.todayTasks}</div>
            <div className="text-sm text-gray-600">Due Today</div>
          </div>
          {/* <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{monthlyStats.averagePerDay}</div>
            <div className="text-sm text-gray-600">Avg/Day</div>
          </div> */}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={viewMode} className="w-full">
          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>
          <TabsContent value="chart">
            <ChartView />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

