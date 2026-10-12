"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyPinSchema, type VerifyPinFormData } from "@/lib/utils/validators";
import { verifyPasswordResetPin, forgotPassword } from "@/lib/api/auth";
import { APIError } from "@/lib/api/client";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function VerifyResetPinForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<VerifyPinFormData>({
    resolver: zodResolver(verifyPinSchema),
  });

  if (!email) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Request</CardTitle>
          <CardDescription>Email address is missing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Please start the password reset process from the beginning.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Request Password Reset</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPinDigits = [...pinDigits];
    newPinDigits[index] = value;
    setPinDigits(newPinDigits);

    // Update form value
    const fullPin = newPinDigits.join("");
    setValue("pin", fullPin);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted data is exactly 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setPinDigits(digits);
      setValue("pin", pastedData);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const onSubmit = async (data: VerifyPinFormData) => {
    setIsSubmitting(true);
    try {
      const response = await verifyPasswordResetPin(email, data.pin);
      toast.success(response.message || "PIN verified successfully");
      // Navigate to reset password page with token
      router.push(`/auth/reset-password?token=${encodeURIComponent(response.resetToken)}`);
    } catch (error) {
      if (error instanceof APIError) {
        if (error.data.errors) {
          Object.entries(error.data.errors).forEach(([field, message]) => {
            setError(field as any, { message });
          });
        } else {
          toast.error(error.message || "Invalid or expired PIN");
        }
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPin = async () => {
    setIsResending(true);
    try {
      const response = await forgotPassword(email);
      toast.success(response.message || "New PIN sent to your email");
      // Clear existing PIN
      setPinDigits(["", "", "", "", "", ""]);
      setValue("pin", "");
      inputRefs.current[0]?.focus();
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message || "Failed to resend PIN");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Verify PIN</CardTitle>
        <CardDescription>
          Enter the 6-digit PIN sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Enter PIN</Label>
            <div className="flex gap-2 justify-center">
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isSubmitting}
                  className="w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>
            {errors.pin && (
              <p className="text-sm text-destructive text-center">{errors.pin.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify PIN"}
          </Button>

          <div className="space-y-2 text-center text-sm">
            <button
              type="button"
              onClick={handleResendPin}
              disabled={isResending}
              className="text-primary hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend PIN"}
            </button>
            <div>
              <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-primary">
                Use a different email
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
