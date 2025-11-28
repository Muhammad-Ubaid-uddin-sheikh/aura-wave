'use client';
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Logout = () => {
    const { user, setUser } = useUser();
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
        <div className='max-w-sm w-full text-center'>
            <p className='text-2xl mb-3'>Welcome, {user?.name || "User"}!</p>
            {user?.email && <p className='text-lg mb-3'>Your email: {user.email}</p>}
            <p className='text-xl mb-3'>You are logged in</p>
            <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
                aria-label="Logout"
                className="rounded-full w-full text-lg hover:bg-accent hover:text-accent-foreground transition-colors mt-2"
            >
                {loading ? "Logging out..." : "Logout"}
            </Button>
        </div>
    );
};

export default Logout;