"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api/auth";
import { APIError } from "@/lib/api/client";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import Link from "next/link";

export function EmailVerificationForm() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const token = searchParams.get("token");

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setError("No verification token provided");
        return;
      }

      setIsVerifying(true);
      try {
        await verifyEmail(token);
        await refreshUser();
        setIsVerified(true);
        toast.success("Email verified successfully!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message || "Verification failed");
        } else {
          setError("An error occurred during verification");
        }
        toast.error("Verification failed");
      } finally {
        setIsVerifying(false);
      }
    };

    performVerification();
  }, [token, router, refreshUser]);

  return (
    <div className="text-center">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Verify Your Email</h1>
      <p className="mb-6 text-gray-600">We&apos;re verifying your email address</p>

      {isVerifying && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {isVerified && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          <p className="font-medium">Email verified successfully!</p>
          <p className="text-sm">Redirecting to dashboard...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-medium">Verification failed</p>
          <p className="text-sm mb-4">{error}</p>
          <Link
            href="/auth/login"
            className="inline-block rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}
