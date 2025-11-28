'use client';

import { User } from "lucide-react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { ShieldUser } from "lucide-react";

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser()

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      localStorage.removeItem("user");
      setUser(null);
      router.refresh(); // Refresh the page to update the UI

    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-label="User Account"
        className=" p-1 cursor-pointer hover:text-primary-hover transition"
      >
        <User size={22} />
      </button>

      {open && (
        <div className="absolute right-0 w-52 bg-white border rounded shadow-md text-sm z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b bg-gray-50 flex flex-col gap-1">
            <p className="text-gray-700 font-semibold text-base truncate">{user?.name || "Guest"}</p>
            {user?.email && <p className="text-gray-400 text- truncate">{user?.email}</p>}
            {user?.role === "admin" && <p className="text-gray-400 text- truncate flex gap-1">Admin <ShieldUser/></p>}
            {user?.role === "admin" && <Link href={"/auraone-admin"}className="hover:text-primary text-sm transition-colors duration-300">Go to Aura Admin</Link>}
            {user?.role === "admin" && <Link href={"/"}className="hover:text-primary text-sm transition-colors duration-300">Go to AuraOne </Link>}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Logout"
            disabled={loading}
            className="block w-full text-left px-4 py-2 text-primary hover:bg-primary/10"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;