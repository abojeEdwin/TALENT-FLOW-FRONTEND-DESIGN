import { redirect } from "next/navigation";

export const metadata = {
  title: "Verify Email - TrailForge",
  description: "Verify your email address to complete registration",
};

export default function VerifyEmailPage() {
  redirect("/auth/login");
}
