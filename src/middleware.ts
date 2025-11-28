import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {

    const token = req.cookies.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized?error=not_admin", req.url));
        }

        // Allow the request to proceed
        return NextResponse.next();
    } catch (error) {
        console.log("Invalid token:", error);
        return NextResponse.redirect(new URL("/unauthorized?error=invalid_token", req.url));
    }
}

export const config = {
    matcher: [
        "/auraone-admin/:path*", // All Admin Routes
        "/auraone-studio/:path*" // All Sanity Studio Routes
    ], 
};