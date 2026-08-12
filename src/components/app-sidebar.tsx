import { Link, useRouterState } from "@tanstack/react-router";
import { Landmark, LayoutDashboard, LayoutGrid, Receipt, FolderKanban, Wallet } from "lucide-react";
import logoAsset from "@/assets/zainab-logo.png.asset.json";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Pending Payments", url: "/pending-payments", icon: Receipt },
  { title: "Category Payments", url: "/category-payments", icon: LayoutGrid },
  { title: "Payments", url: "/payments", icon: Wallet },
  { title: "Investments", url: "/investments", icon: Landmark },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img
            src={logoAsset.url}
            alt="Zainab Construction & Real Estate logo"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-xl object-contain"
          />
          {!collapsed && (
            <span className="font-display text-sm font-semibold leading-tight">
              Zainab Construction
              <span className="block text-xs font-normal text-muted-foreground">
                & Real Estate
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
