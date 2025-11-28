import { siteConfig } from '@/constants/siteConfig';
import { transporter } from '@/lib/helpers/emailTransporter';

export async function sendVerificationEmail(email: string, token: string, type: "signup" | "admin" = "signup") {
    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify?token=${token}&type=${type}`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #333;">${type === "admin" ? "Admin Login Verification" : "Verify Your Account"}</h2>
            <p>Click the button below to ${type === "admin" ? "complete admin sign-in" : "verify your email"}:</p>
            <a href="${link}" target="_blank" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #4a5568;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
            ">
            ${type === "admin" ? "Verify Admin Login" : "Verify Email"}
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
            If you didn’t request this, you can safely ignore this email.
            </p>
        </div>
    `;
    
    const mailOptions = {
        from: `"${siteConfig.name}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: type === "admin" ? "Admin Login Verification" : "Verify your email",
        html,
        text: `Click the link to verify your email: ${link}`
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
}