import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login - TrailForge",
  description: "Sign in to your TrailForge account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LoginForm />
    </div>
  );
}
