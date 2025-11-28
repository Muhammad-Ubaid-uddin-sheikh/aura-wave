import { siteConfig } from '@/constants/siteConfig';
import { transporter } from '@/lib/helpers/emailTransporter';

export async function sendResetPasswordEmail(email: string, token: string) {
    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>If you requested to reset your password, click the button below:</p>
            <a href="${link}" target="_blank" style="
                display: inline-block;
                padding: 10px 20px;
                background-color: #4a5568;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
            ">
                Reset Password
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
                If you didn’t request this, you can safely ignore this email.
            </p>
        </div>
    `;

    const mailOptions = {
        from: `"${siteConfig.name}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your password",
        html,
        text: `Reset your password here: ${link}`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
}