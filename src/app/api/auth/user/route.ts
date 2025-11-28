import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; email: string; role: string };
    const user = await client.fetch(`*[_type == "user" && _id == $id][0]`, {
      id: decoded.id,
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
      },
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}