"use client";
import { useState } from "react";
import { toast } from "sonner";

const VerificationNotice = ({ email }: { email: string }) => {
    const [loading, setLoading] = useState(false);

    const handleResend = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.message);
            } else {
                toast.success(result.message);
            }
        } catch (err) {
            toast.error("Failed to resend email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary">Verify Your Email</h2>
            <p className="text-muted-foreground">
                A verification link has been sent to <span className="font-medium">{email}</span>. <br />
                Please check your inbox and click the link to complete registration.
            </p>

            <button
                onClick={handleResend}
                disabled={loading}
                className="text-sm underline text-primary"
            >
                {loading ? "Resending..." : "Didn't receive the email? Resend"}
            </button>
        </div>
    );
};

export default VerificationNotice;