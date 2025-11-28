import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/helpers/sendVerificationEmail";
import { TOKEN_EXPIRY_TIME } from "@/constants/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin" && user.isVerified) {
      return NextResponse.json({ message: "User already verified" }, { status: 400 });
    }

    const newToken = uuidv4();
    const newTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_TIME); // 24 hours

    await client.patch(user._id)
      .set({ verificationToken: newToken, verificationTokenExpiry: newTokenExpiry.toISOString() })
      .commit();

    await sendVerificationEmail(email, newToken, user.role === "admin" ? "admin" : "signup");

    return NextResponse.json({ message: "Verification email resent successfully." }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to resend email" }, { status: 500 });
  }
}