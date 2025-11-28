import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { client } from "@/sanity/lib/client";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "@/lib/helpers/sendVerificationEmail";
import { TOKEN_EXPIRY_TIME } from "@/constants/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    const userExists = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_TIME); // 24 hours
    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user"

    await client.create({
      _type: "user",
      name,
      email,
      password: hashedPassword,
      role: role,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry: verificationTokenExpiry.toISOString(),
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      message: "User created",
      redirect: `${process.env.NEXT_PUBLIC_SITE_URL}/auth?pendingVerification=true&email=${encodeURIComponent(email)}`
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error during signup:", error);
    return NextResponse.json({ message: "Signup failed", error: error.message }, { status: 500 });
  }
}