export interface DueDateAnalytics {
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  dueNextWeek: number;
  noDueDate: number;
  total: number;
}

export interface DueDateBreakdown {
  category: 'overdue' | 'dueToday' | 'dueTomorrow' | 'dueThisWeek' | 'dueNextWeek' | 'noDueDate';
  label: string;
  count: number;
  percentage: number;
  color: string;
  urgent?: boolean;
}
