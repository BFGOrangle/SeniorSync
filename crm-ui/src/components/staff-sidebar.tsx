"use client";

import { useState } from "react";
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
  UserCircle,
  ChevronDown,
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

// Navigation items for staff
const navigationItems = [
  {
    title: "Dashboard",
    url: "/staff",
    icon: Layout,
  },
  {
    title: "Request Management",
    url: "/staff/request-management", 
    icon: FileText,
    children: [
      {
        title: "All Requests",
        url: "/staff/request-management"
      },
      {
        title: "AI Recommendations",
        url: "/staff/request-management/ai-recommendations"
      }
    ]
  },
  {
    title: "Senior Profiles",
    url: "/staff/senior-profiles",
    icon: Users,
  },
];

export function StaffSidebar() {
  const pathname = usePathname();
  const { signOut, currentUser } = useCurrentUser();
  
  // State to track which menu items are expanded
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Function to toggle expansion
  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev => 
      prev.includes(itemTitle) 
        ? prev.filter(title => title !== itemTitle)
        : [...prev, itemTitle]
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Amplify will handle the redirect via auth state change
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-blue-600 shrink-0" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">SeniorSync</span>
            <span className="text-xs text-muted-foreground">Staff Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // Handle items with children (like Request Management)
                if (item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        onClick={() => toggleExpanded(item.title)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 justify-between w-full">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform ${
                              expandedItems.includes(item.title) ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </SidebarMenuButton>
                      {/* Conditionally render children based on expanded state */}
                      {expandedItems.includes(item.title) && (
                        <SidebarMenu className="ml-4">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.url;
                            return (
                              <SidebarMenuItem key={child.title}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={isChildActive}
                                  tooltip={child.title}
                                >
                                  <Link href={child.url} className="flex items-center gap-2">
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      )}
                    </SidebarMenuItem>
                  );
                }

                // Handle regular items with direct URLs
                const isActive =
                  pathname === item.url ||
                  (item.title === "Dashboard" && pathname === "/staff/dashboard");
                
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
              <Link href={`/staff/${currentUser.id}`}>
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
            <p>Staff Portal</p>
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
              <Link href={`/staff/${currentUser.id}`}>
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