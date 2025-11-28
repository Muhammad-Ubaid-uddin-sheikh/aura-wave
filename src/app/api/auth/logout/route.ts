import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // Expire immediately
  });

  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}