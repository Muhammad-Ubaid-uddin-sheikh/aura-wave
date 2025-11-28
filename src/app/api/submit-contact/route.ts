import { NextRequest, NextResponse } from "next/server";
import { sendContactMessageEmail } from "@/lib/helpers/sendContactMessageEmail";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, number, message } = body

        // Send the contact message to email
        await sendContactMessageEmail({ name, email, number, message });

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Contact Form Error:", error);
        return NextResponse.json({ error: "Failed to submit contact message" }, { status: 500 });
    }
}