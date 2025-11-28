'use client';
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MobileLogoutButton = () => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Logout"
      className="rounded-full w-full text-lg hover:bg-primary hover:text-secondary-foreground transition-colors mt-2"
    >
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default MobileLogoutButton;