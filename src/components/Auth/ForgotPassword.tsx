'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { emailSchema } from "@/schemas/fields";
import Link from "next/link";

const formSchema = z.object({
    email: emailSchema,
});

const ForgotPassword = ({ emailPrefill = "" }: { emailPrefill?: string }) => {
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: { email: string }) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) {
                toast.error(result.message);
                return;
            }

            toast.success("Password reset link sent to your email");
            setCooldown(60); // Start cooldown for 60 seconds
            setValue("email", "");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Set email prefill if provided
    useEffect(() => {
        if (emailPrefill) {
            setValue("email", emailPrefill)
        }
    }, [emailPrefill])

    // Cooldown countdown
    useEffect(() => {
        if (cooldown === 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) clearInterval(timer);
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-center">Forgot Password</h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            placeholder="Enter your email"
                            {...register("email")}
                            disabled={loading}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading
                                ? "Sending..."
                                : cooldown > 0
                                ? `Resend in ${cooldown}s`
                                : "Send Reset Link"
                            }
                        </Button>
                        <div className="text-center mt-4">
                            <Link href={`/auth${emailPrefill ? `?email=${encodeURIComponent(emailPrefill)}` : ""}`}
                            className="text-secondary-foreground/70 hover:underline"
                            >
                                Go To Login Page
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default ForgotPassword