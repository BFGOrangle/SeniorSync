"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Users,
  Settings,
  HeartHandshake,
  Layout,
  PlusCircleIcon,
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
import { Separator } from "@/components/ui/separator";

// Navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Layout,
  },
  {
    title: "Senior Request Management",
    url: "/admin/request-management",
    icon: FileText,
  },
  {
    title: "Create Senior Request",
    url: "/admin/create-senior-request",
    icon: PlusCircleIcon,
  },
  {
    title: "Senior Profiles",
    url: "/admin/senior-profiles",
    icon: Users,
  },
];

const settingsItems = [
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    badge: "Coming Soon",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r">
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
                        {/* {item.badge && (
                          <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )} */}
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
        <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <p>Admin Panel</p>
          <p>v1.0.0</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
