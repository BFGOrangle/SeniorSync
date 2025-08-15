"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/contexts/user-context";
import {
  FileText,
  Users,
  Settings,
  HeartHandshake,
  Layout,
  LogOut,
  Brain,
  UserCog,
  UserCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Layout,
  },
  {
    title: "Request Management",
    url: "/admin/request-management",
    icon: FileText,
  },
  {
    title: "AI Recommendations",
    url: "/admin/ai-recommendations",
    icon: Brain,
    badge: "NEW",
  },
  {
    title: "Senior Profiles",
    url: "/admin/senior-profiles",
    icon: Users,
  },
];

const settingsItems = [
  {
    title: "Staff Management",
    url: "/admin/staff",
    icon: UserCog,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    badge: "Coming Soon",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut, currentUser } = useCurrentUser();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Amplify will handle the redirect via auth state change
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r z-30">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-blue-600 shrink-0" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">SeniorSync</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.title === "Dashboard" &&
                    pathname === "/admin/dashboard");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-3 group-data-[collapsible=icon]:hidden">
          {/* Profile Button */}
          {/* {currentUser && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Link href={`/admin/staff/${currentUser.id}`}>
                <UserCircle className="h-4 w-4 mr-2" />
                My Profile
              </Link>
            </Button>
          )} */}

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <div className="text-xs text-muted-foreground">
            <p>Admin Panel</p>
            <p>v1.0.0</p>
          </div>
        </div>

        {/* Icon-only mode buttons */}
        <div className="group-data-[collapsible=icon]:block hidden space-y-2">
          {/* Profile Button - Icon Only */}
          {/* {currentUser && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full p-2"
              title="My Profile"
            >
              <Link href={`/admin/staff/${currentUser.id}`}>
                <UserCircle className="h-4 w-4" />
              </Link>
            </Button>
          )} */}

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full p-2"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
