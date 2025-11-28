"use client"

import {
  LayoutDashboard,
  Package,
  Boxes,
  PackagePlus,
  Users,
  Layers,
  MessageSquare,
  UserCog,
  Settings,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/auraone-admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: "/auraone-admin/orders",
    icon: Package,
  },
  {
    title: "Products",
    url: "/auraone-admin/products",
    icon: Boxes,
  },
  {
    title: "Add Product",
    url: "/auraone-admin/add-product",
    icon: PackagePlus,
  },
  {
    title: "Customers",
    url: "/auraone-admin/customers",
    icon: Users,
  },
  {
    title: "Collections",
    url: "/auraone-admin/collections",
    icon: Layers,
  },
  {
    title: "Reviews",
    url: "/auraone-admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Users",
    url: "/auraone-admin/users",
    icon: UserCog,
  },
];

export function AppSidebar() {
    const [active, setActive] = useState("");
    const pathname = usePathname()

    useEffect(() => {
        const activeItem = items.find((item) => item.url === pathname);
        if (activeItem) setActive(activeItem.title);
    }, [pathname]);

    return (
        <Sidebar className="mt-16 h-full">
            <SidebarContent className="pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="mb-4">Admin Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild className={`rounded-none mb-2 w-full p-2   ${active === item.title ? "bg-[#ebe8e8]" : ""} `}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}