"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, registerSchema } from "@/schemas/auth"

const AuthForm = ({ emailPrefill = "" }: { emailPrefill?: string }) => {
  const [state, setState] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
    reset,
    watch,
  } = useForm<{ email: string; password: string; name?: string }>({
    resolver: zodResolver(state === "login" ? loginSchema : registerSchema),
  });

  const email = watch("email");

  const handleSignup = async (data: { name: string; email: string; password: string }) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      // Show verification UI
      if (result.redirect) {
        router.push(result.redirect);
      }
    } catch (error) {
      toast.error("Signup failed");
    } finally {
      setLoading(false)
    }
  };

  const handleLogin = async (data: { email: string; password: string; }) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      // If the user is an admin, handle it differently
      if (result.redirect) {
        router.push(result.redirect);
        reset();
        return;
      }

      // If the user is not an admin, set the user context and redirect
      router.refresh();
      router.replace(window.location.pathname) // Remove search params, This keeps only the base path

      setUser({ id: result.id, email: result.email, name: result.name });
      toast.success("Login successful");
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setLoading(false)
    }
  };

  // Submit handler (calls login or signup based on state)
  const onSubmit = (data: any) => {
    if (state === "login") {
      handleLogin(data);
    } else {
      handleSignup(data);
    }
  };

  const toggleState = () =>
    setState((prev) => (prev === "login" ? "register" : "login"));

  // Handle form errors
  const onError = (errors: any) => {
    const keys = Object.keys(errors);
    if (keys.length > 0) {
      setFocus(keys[0] as any); // focus first error field
    }
  };

  // Focus on name field if it has an error when switching to register state
  useEffect(() => {
    if (errors.name && state === "register") {
      setTimeout(() => {
        setFocus("name");
      }, 0);
    }
  }, [errors.name, setFocus, state]);

  // Set email prefill if provided
  useEffect(() => {
    if (emailPrefill) {
      setValue("email", emailPrefill)
    }
  }, [emailPrefill])

  return (
    <div className="bg-white text-gray-500 md:p-6 p-4 text-left text-sm rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10 w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        {state === "login" ? "Login" : "Sign Up"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        {state === "register" && (
          // Name field for registration
          <div>
            <Input
              disabled={loading} {...register("name")} placeholder="Enter your name" className="text-foreground" />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <Input
            disabled={loading}
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className="text-foreground"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message as string}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
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

        {/* Forgot Password */}
        {state === "login" && (
          <div className="text-right">
            <a
              href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="text-sm text-primary underline">
              Forgot Password?
            </a>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {state === "login" ? "Log in" : "Create Account"}
        </Button>
      </form>

      {/* Toggle SignIn & SignUp */}
      <p className="text-center mt-4 text-sm">
        {state === "login"
          ? "Don’t have an account?"
          : "Already have an account?"}{" "}
        <button onClick={toggleState} className="text-primary underline">
          {state === "login" ? "SignUp" : "SignIn"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;