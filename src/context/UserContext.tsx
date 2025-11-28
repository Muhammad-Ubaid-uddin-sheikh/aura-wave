'use client';

import { createContext, useContext, useState, useEffect, useRef } from "react";

interface UserData {
    id: string;
    email: string;
    name: string;
    role?: "user" | "admin";
}

interface UserContextType {
    user: UserData | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const hasFetchedUser = useRef(false);
    // console.log("user", user)

    useEffect(() => {
        if (hasFetchedUser.current) return; // Prevent multiple fetches
        hasFetchedUser.current = true;

        // Check localStorage first
        const localUser = localStorage.getItem("user");
        if (localUser) {
            setUser(JSON.parse(localUser));
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/user");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        localStorage.setItem("user", JSON.stringify(data.user));
                    } else {
                        localStorage.removeItem("user");
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}