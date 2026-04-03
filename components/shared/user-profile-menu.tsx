"use client";

import { useAuth } from "@/lib/context/auth-context";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export function UserProfileMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
          title="Profile Settings"
        >
          <User className="h-5 w-5 text-gray-700" />
        </Link>

        <button
          onClick={() => logout()}
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 p-2 hover:bg-red-100"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-red-600" />
        </button>
      </div>
    </div>
  );
}
