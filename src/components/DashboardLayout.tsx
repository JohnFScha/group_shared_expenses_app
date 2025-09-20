import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  BarChart3, 
  Settings,
  Home,
  Plus,
  LogOut
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigation } from "../hooks/useNavigation";
import { useAuthActions } from "@convex-dev/auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SidebarData {
  title: string;
  items: {
    title: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    variant?: "default" | "outline";
  }[];
}

interface DashboardSidebarProps {
  data: SidebarData[];
  user?: {
    name: string;
    email: string;
  };
}

function DashboardSidebar({ data, user }: DashboardSidebarProps) {
  const { signOut } = useAuthActions();
  
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DollarSign className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Shared Expenses</span>
            <span className="truncate text-xs text-muted-foreground">Group Finance</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {data.map((section, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={itemIndex}>
                    <SidebarMenuButton 
                      onClick={item.onClick}
                      variant={item.variant}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      {user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => void signOut()}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const { navigateTo } = useNavigation();

  // Handle navigation using the navigation context
  const handleNavigation = (section: string) => {
    navigateTo(section as any);
  };

  const sidebarData: SidebarData[] = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          onClick: () => handleNavigation("dashboard"),
        },
        {
          title: "Groups",
          icon: Users,
          onClick: () => handleNavigation("groups"),
        },
      ],
    },
    {
      title: "Finances",
      items: [
        {
          title: "Expenses",
          icon: DollarSign,
          onClick: () => handleNavigation("expenses"),
        },
        {
          title: "Payments",
          icon: CreditCard,
          onClick: () => handleNavigation("payments"),
        },
        {
          title: "Balances",
          icon: BarChart3,
          onClick: () => handleNavigation("balances"),
        },
      ],
    },
    {
      title: "Actions",
      items: [
        {
          title: "Add Expense",
          icon: Plus,
          onClick: () => handleNavigation("select-group-for-expense"),
          variant: "outline" as const,
        },
        {
          title: "Settings",
          icon: Settings,
          onClick: () => handleNavigation("settings"),
        },
      ],
    },
  ];

  const userData = loggedInUser ? {
    name: loggedInUser.name || loggedInUser.email || "User",
    email: loggedInUser.email || "user@example.com",
  } : undefined;

  return (
    <SidebarProvider>
      <DashboardSidebar 
        data={sidebarData} 
        user={userData}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Shared Expenses</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}