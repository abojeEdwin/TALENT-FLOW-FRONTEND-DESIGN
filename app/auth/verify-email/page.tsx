import { EmailVerificationForm } from "@/components/auth/email-verification-form";

export const metadata = {
  title: "Verify Email - TrailForge",
  description: "Verify your email address to complete registration",
};

export default function VerifyEmailPage() {
  return <EmailVerificationForm />;
}
