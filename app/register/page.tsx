import { OrganisationRegisterForm } from "@/components/auth/organisation-register-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Register Organisation - TrailForge",
  description: "Create your organisation account on TrailForge",
};

const FEATURES = [
  "Full control over your organisation's users",
  "Instructors create and manage courses",
  "Learners access only your content",
  "Real-time analytics and progress tracking",
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left branding panel (hidden on small screens) ── */}
      <div className="hidden lg:flex w-[45%] xl:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        {/* subtle background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle at 20% 80%, white 0%, transparent 60%)" }}
        />

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3 z-10">
          <img src="/logo.png" alt="TrailForge" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold">TrailForge</span>
        </Link>

        {/* Main copy */}
        <div className="space-y-6 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium">
            <Building2 className="w-4 h-4" />
            Multi-tenant Learning Platform
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
            One platform.<br />
            Every team.<br />
            Unlimited learning.
          </h1>

          <p className="text-primary-foreground/75 text-lg leading-relaxed max-w-md">
            Register your organisation and take full control — onboard instructors,
            enrol learners, and track progress from a single dashboard.
          </p>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-primary-foreground/60" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-foreground/50 z-10">
          © {new Date().getFullYear()} TrailForge. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          {/* Mobile logo */}
          <Link href="/home" className="flex items-center gap-2 lg:hidden">
            <img src="/logo.png" alt="TrailForge" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-sm">TrailForge</span>
          </Link>
          <div className="lg:ml-auto flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <span className="hidden sm:block text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </span>
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-10">
          <div className="w-full max-w-xl">
            {/* Mobile sign-in link */}
            <p className="sm:hidden text-sm text-center text-muted-foreground mb-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>

            <OrganisationRegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
