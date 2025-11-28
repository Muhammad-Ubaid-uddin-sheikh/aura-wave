"use client";
import Image from "next/image";
import React from "react";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import UserDropdown from "./UserDropDown";
import { siteConfig } from "@/constants/siteConfig";

const Header = () => {
    const sidebarTriggerRef = React.useRef<HTMLButtonElement>(null);

    const handleMenuClick = () => {
        sidebarTriggerRef.current?.click();
    };

    return (
        <div className="w-full fixed top-0 z-50 bg-sidebar text-sidebar-foreground shadow-md">
            <div className="h-16 px-6 flex items-center justify-between">
                {/* Mobile Menu Icon */}
                <Menu
                    className="block md:hidden cursor-pointer transition-transform transform hover:scale-110"
                    size={30}
                    onClick={handleMenuClick}
                    aria-label="Open Sidebar"
                />
                <SidebarTrigger ref={sidebarTriggerRef} className="sr-only" />

                {/* Logo */}
                <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={65}
                    height={65}
                    priority
                    className="cursor-pointer transition-all duration-300 hover:scale-105"
                />

                {/* Title */}
                <h1 className="hidden md:block text-2xl font-bold tracking-wide text-center cursor-default">
                    Admin Dashboard
                </h1>

                {/* User Profile */}
                <UserDropdown />
            </div>
        </div>
    );
};

export default Header;