import { redirect } from "next/navigation";

// Registration now lives outside the auth layout at /register
// so it renders full-screen without the max-w-sm wrapper constraint.
export default function RegisterRedirectPage() {
  redirect("/register");
}
