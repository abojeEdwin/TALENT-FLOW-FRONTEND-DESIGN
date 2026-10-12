"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordWithTokenSchema, type ResetPasswordWithTokenFormData } from "@/lib/utils/validators";
import { resetPasswordWithToken } from "@/lib/api/auth";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordWithTokenFormData>({
    resolver: zodResolver(resetPasswordWithTokenSchema),
  });

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Link</CardTitle>
          <CardDescription>
            The password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please request a new password reset.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Request Password Reset</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: ResetPasswordWithTokenFormData) => {
    setIsSubmitting(true);
    try {
      const response = await resetPasswordWithToken(token, data.password);
      toast.success(response.message || "Password reset successful!");
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof APIError) {
        if (error.data.errors) {
          Object.entries(error.data.errors).forEach(([field, message]) => {
            setError(field as any, { message });
          });
        } else {
          toast.error(error.message || "Password reset failed");
        }
      } else {
        toast.error("An error occurred during password reset");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with letters and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
