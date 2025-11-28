import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const userQuery = `*[_type == "user" && email == $email && resetToken == $token][0]`;
    const user = await client.fetch(userQuery, { email, token });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
    }

    const tokenExpiry = new Date(user.resetTokenExpiry);
    if (tokenExpiry < new Date()) {
      return NextResponse.json({ message: "Reset token has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client
      .patch(user._id)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .commit();

    return NextResponse.json({ 
      message: "Password reset successfully.",
      redirect: `${process.env.NEXT_PUBLIC_SITE_URL}/auth?email=${encodeURIComponent(email)}`
     }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Server error. Please try again." }, { status: 500 });
  }
}