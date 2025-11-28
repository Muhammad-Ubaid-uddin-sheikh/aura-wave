import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "@/lib/helpers/sendVerificationEmail";
import { TOKEN_EXPIRY_TIME } from "@/constants/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email before logging in." },
        { status: 403 }
      );
    }

    // If the user is an admin, send a verification link
    // if (user.role === "admin"){
    //   const token = uuidv4();
    //   const tokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_TIME); // 24 hours

    //   await client.patch(user._id)
    //     .set({ verificationToken: token, verificationTokenExpiry: tokenExpiry.toISOString() })
    //     .commit();

    //   await sendVerificationEmail(user.email, token, "admin");

    //   return NextResponse.json({
    //     redirect: `/auth?pendingVerification=true&email=${encodeURIComponent(email)}`
    //   }, { status: 200 });
    // }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined.");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ id: user._id, email: user.email, name: user.name }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}