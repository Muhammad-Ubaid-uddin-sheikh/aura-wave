import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (!token) {
        return NextResponse.json({ message: "Invalid verification link" }, { status: 400 });
    }

    try {
        const user = await client.fetch(
            `*[_type == "user" && verificationToken == $token][0]`,
            { token } as Record<string, string | null>
        );

        if (!user) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 404 });
        }

        const tokenExpiry = new Date(user.verificationTokenExpiry);

        // Check if the token has expired
        if (tokenExpiry < new Date()) {
            return NextResponse.json({ message: "Verification token has expired" }, { status: 400 });
        }

        // If this is a sign-up verification
        if (type !== "admin") {
            await client.patch(user._id)
                .set({ isVerified: true, verificationToken: null, verificationTokenExpiry: null })
                .commit();

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?verified=true&email=${encodeURIComponent(user.email)}`);
        }

        // If this is an admin verification
        if (type === "admin") {
            const tokenJwt = jwt.sign({
                id: user._id,
                email: user.email,
                role: user.role,
            }, process.env.JWT_SECRET!, { expiresIn: "30d" });

            await client.patch(user._id)
                .set({ verificationToken: null, verificationTokenExpiry: null })
                .commit();

            cookies().set("token", tokenJwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
            });

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auraone-admin`);
        }

        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}