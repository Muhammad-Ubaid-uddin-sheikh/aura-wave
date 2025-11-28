'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createPasswordSchema } from "@/schemas/fields";

const schema = z.object({
    password: createPasswordSchema,
});

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (!token || !email) {
            toast.error("Invalid or missing token.");
            router.push("/auth/forgot-password");
        }
    }, [token, email, router]);

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: data.password, token, email }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.message || "Something went wrong.");
                return;
            }

            // If the API returns a redirect URL, navigate to it
            if (result.redirect) {
                toast.success(result.message || "Password reset successful");
                router.push(result.redirect);
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 border rounded-xl shadow-lg my-10">
            <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label>New Password</Label>
                    <div className="relative flex items-center">
                        <Input
                            disabled={loading}
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-10 text-foreground"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.password.message as string}
                        </p>
                    )}
                </div>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    Reset Password
                </Button>
            </form>
        </div>
    );
}