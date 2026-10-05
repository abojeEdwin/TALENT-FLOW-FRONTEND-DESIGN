"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerOrganisation, setAuthToken } from "@/lib/api/auth";
import { useAuth } from "@/lib/context/auth-context";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Building2, User, Mail, Lock } from "lucide-react";

const schema = z.object({
  organizationName: z
    .string()
    .min(2, "Organisation name must be at least 2 characters")
    .max(255),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export function OrganisationRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await registerOrganisation({
        organizationName: data.organizationName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      // Backend returns a token on registration — log the user straight in
      setAuthToken(response.accessToken);
      await refreshUser();
      toast.success(`Welcome! "${response.email}" organisation created.`);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 409) {
          toast.error("An account with this email already exists.");
        } else if (error.status === 400) {
          toast.error(error.message || "Please check your details and try again.");
        } else {
          toast.error(error.message || "Registration failed");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Organisation Registration
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Create your organisation
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Set up your organisation and admin account. You'll onboard instructors
          and learners from your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Organisation section ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Organisation
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Organisation Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register("organizationName")}
              autoComplete="organization"
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
              placeholder="Acme Corp"
              disabled={isSubmitting}
            />
            {errors.organizationName && (
              <p className="text-sm text-destructive">{errors.organizationName.message}</p>
            )}
          </div>
        </div>

        {/* ── Admin account section ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Admin Account
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                autoComplete="given-name"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                placeholder="John"
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Last Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("lastName")}
                autoComplete="family-name"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                placeholder="Doe"
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Work Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                {...register("email")}
                autoComplete="email"
                className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                placeholder="admin@acmecorp.com"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                autoComplete="new-password"
                className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                At least 8 characters with letters and numbers
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                autoComplete="new-password"
                className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          By registering you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </p>

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isSubmitting ? "Creating organisation..." : "Create Organisation"}
        </Button>
      </form>
    </div>
  );
}
