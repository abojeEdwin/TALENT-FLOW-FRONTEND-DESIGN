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
    
    // Debug logging
    console.log('[DEBUG] Form submitted with data:', {
      email: data.email,
      passwordLength: data.password?.length,
    });
    
    try {
      const response = await loginUser(data.email, data.password);
      console.log('[Login] Login response:', response);
      console.log('[Login] User role:', response.user.role);
      console.log('[Login] User object:', response.user);
      
      // Set token and user
      setAuthToken(response.accessToken);
      setUser(response.user);
      
      toast.success(`Welcome, ${response.user.firstName}!`);
      
      // Route based on role immediately
      const userRole = response.user.role;
      console.log('[Login] About to route user with role:', userRole);
      
      if (userRole === "ORG_ADMIN" || userRole === "SUPER_ADMIN") {
        console.log('[Login] ADMIN DETECTED - Routing to /dashboard/admin');
        setTimeout(() => {
          router.push("/dashboard/admin");
        }, 100);
      } else if (userRole === "INSTRUCTOR") {
        console.log('[Login] INSTRUCTOR DETECTED - Routing to /dashboard/instructor');
        setTimeout(() => {
          router.push("/dashboard/instructor");
        }, 100);
      } else if (userRole === "LEARNER") {
        console.log('[Login] LEARNER DETECTED - Routing to /dashboard/learner');
        setTimeout(() => {
          router.push("/dashboard/learner");
        }, 100);
      } else {
        console.log('[Login] UNKNOWN ROLE - Routing to /dashboard');
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 404) {
          toast.error("Unable to connect to server. Please try again later.");
        } else if (error.status === 401) {
          toast.error("Invalid credentials");
        } else if (error.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (error.data.errors) {
          Object.entries(error.data.errors).forEach(([field, message]) => {
            setError(field as any, { message });
          });
        } else {
          toast.error(error.message || "Login failed");
        }
      } else if (error instanceof Error && error.message === "Network error") {
        toast.error("Unable to connect to server. Please check your connection.");
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
            <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
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
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register your organisation
        </Link>
      </p>
    </div>
  );
}
