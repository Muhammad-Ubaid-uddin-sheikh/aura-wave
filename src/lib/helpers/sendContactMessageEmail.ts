import { siteConfig } from '@/constants/siteConfig';
import { transporter } from '@/lib/helpers/emailTransporter';

interface ContactMessageParams {
    name: string;
    email: string;
    number: string;
    message: string;
}

export async function sendContactMessageEmail({
    name,
    email,
    number,
    message,
}: ContactMessageParams) {
    const html = `
        <div style="font-family: sans-serif; background-color: #f7f7f7; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="margin-bottom: 20px; color: #333333;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                <td style="font-weight: bold; padding: 8px 0; width: 120px; color: #555;">Name:</td>
                <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                <td style="font-weight: bold; padding: 8px 0; color: #555;">Email:</td>
                <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                <td style="font-weight: bold; padding: 8px 0; color: #555;">Phone:</td>
                <td style="padding: 8px 0;">${number}</td>
                </tr>
                <tr>
                <td style="font-weight: bold; padding: 8px 0; vertical-align: top; color: #555;">Message:</td>
                <td style="padding: 8px 0; white-space: pre-wrap;">${message}</td>
                </tr>
            </table>
            <p style="margin-top: 30px; font-size: 12px; color: #999;">
                This message was sent from your website contact form.
            </p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: siteConfig.email,
        replyTo: email,
        subject: "📬 New Contact Message Received",
        html,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${number}\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending contact message email:", error);
        throw error;
    }
}