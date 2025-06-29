import { 
  Calendar,
  FileText,
  Users,
  BarChart3,
  HeartHandshake,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  {
    title: "Total Requests",
    value: "124",
    description: "This month",
    icon: HeartHandshake,
    trend: "+12%",
    color: "text-blue-600",
  },
  {
    title: "Pending Requests",
    value: "23",
    description: "Awaiting response",
    icon: Clock,
    trend: "-5%",
    color: "text-orange-600",
  },
  {
    title: "Urgent Cases",
    value: "8",
    description: "Requires immediate attention",
    icon: AlertCircle,
    trend: "+2",
    color: "text-red-600",
  },
  {
    title: "Completed",
    value: "93",
    description: "Successfully resolved",
    icon: TrendingUp,
    trend: "+18%",
    color: "text-green-600",
  },
];

const quickActions = [
  {
    title: "New Senior Request",
    description: "Create a new request for senior assistance",
    href: "/admin/senior-requests",
    icon: HeartHandshake,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    title: "View Tickets",
    description: "Check upcoming appointments and schedules",
    href: "/admin/tickets",
    icon: Calendar,
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    title: "Manage Senior Profiles",
    description: "View and manage client information",
    href: "/admin/senior-profiles",
    icon: Users,
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your SeniorSync CRM dashboard. Here's an overview of your current activities.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center pt-1">
                <span className={`text-xs font-medium ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={action.href} className={action.disabled ? "pointer-events-none" : ""}>
                  <Button 
                    className="w-full" 
                    disabled={action.disabled}
                    variant={action.disabled ? "secondary" : "default"}
                  >
                    {action.disabled ? "Coming Soon" : "Go to " + action.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and actions in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
              <HeartHandshake className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">New senior request submitted</p>
                <p className="text-sm text-muted-foreground">
                  Margaret Johnson requested transportation assistance
                </p>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">Request completed</p>
                <p className="text-sm text-muted-foreground">
                  Home care service for Robert Davis completed successfully
                </p>
              </div>
              <span className="text-sm text-muted-foreground">4 hours ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
              <Clock className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium">Urgent request pending</p>
                <p className="text-sm text-muted-foreground">
                  Medical assistance needed for Eleanor Smith
                </p>
              </div>
              <span className="text-sm text-muted-foreground">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 