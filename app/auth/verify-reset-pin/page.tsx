import { VerifyResetPinForm } from "@/components/auth/verify-reset-pin-form";
import { Suspense } from "react";

export const metadata = {
  title: "Verify PIN - TalentFlow",
  description: "Verify your password reset PIN",
};

export default function VerifyResetPinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyResetPinForm />
    </Suspense>
  );
}
