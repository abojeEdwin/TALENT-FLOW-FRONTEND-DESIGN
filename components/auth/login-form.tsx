"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/utils/validators";
import { loginUser, setAuthToken } from "@/lib/api/auth";
import { APIError } from "@/lib/api/client";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth-context";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      console.log("[Login] Calling loginUser...");
      const response = await loginUser(data.email, data.password);
      console.log("[Login] loginUser success, response.user:", response.user);
      
      console.log("[Login] Setting auth token...");
      setAuthToken(response.accessToken);
      console.log("[Login] Setting user in context...");
      setUser(response.user);
      
      console.log("[Login] Redirecting to /dashboard...");
      toast.success(`Welcome, ${response.user.firstName}!`);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof APIError) {
        if (error.data.errors) {
          Object.entries(error.data.errors).forEach(([field, message]) => {
            setError(field as any, { message });
          });
        } else {
          toast.error(error.message || "Invalid credentials");
        }
      } else {
        toast.error("An error occurred during login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <img 
          src="/logo.png" 
          alt="TrailForge Logo" 
          className="w-12 h-12 rounded-xl mb-4 object-cover"
        />
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="text-muted-foreground mt-1">Enter your details to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Link href="/auth/reset-password" className="text-sm font-medium text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            {...register("password")}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
