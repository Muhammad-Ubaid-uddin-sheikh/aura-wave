import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { client } from "@/sanity/lib/client";
import { sendResetPasswordEmail } from "@/lib/helpers/sendResetPasswordEmail";
import { TOKEN_EXPIRY_TIME } from "@/constants/auth";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email });

        if (!user) {
            return NextResponse.json({ message: "No user found with that email" }, { status: 404 });
        }

        const token = uuidv4();
        const tokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_TIME); // 24 Hours expiry

        await client.patch(user._id)
            .set({ resetToken: token, resetTokenExpiry: tokenExpiry.toISOString() })
            .commit();

        await sendResetPasswordEmail(user.email, token);

        return NextResponse.json({ message: "Reset email sent successfully." }, { status: 200 });
    } catch (error) {
        NextResponse.json({ message: "Failed to send reset Email" }, { status: 500 });
    }
}