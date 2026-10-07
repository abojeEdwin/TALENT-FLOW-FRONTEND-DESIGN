"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useNotifications } from "@/lib/context/notification-context";
import {
  ADMIN_MENU_ITEMS,
  INSTRUCTOR_MENU_ITEMS,
  LEARNER_MENU_ITEMS,
  SHARED_MENU_ITEMS,
} from "@/lib/utils/constants";
import { RoleName } from "@/lib/api/types";
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  FolderKanban,
  FileText,
  ClipboardList,
  TrendingUp,
  User,
  MessageSquare,
} from "lucide-react";

const getIconForLabel = (label: string) => {
  const labelLower = label.toLowerCase();
  if (labelLower.includes("message")) return MessageSquare;
  if (labelLower.includes("user")) return Users;
  if (labelLower.includes("instructor")) return GraduationCap;
  if (labelLower.includes("program")) return FolderKanban;
  if (labelLower.includes("course")) return BookOpen;
  if (labelLower.includes("material")) return FileText;
  if (labelLower.includes("assignment")) return ClipboardList;
  if (labelLower.includes("progress")) return TrendingUp;
  if (labelLower.includes("profile")) return User;
  if (labelLower.includes("setting")) return Settings;
  return Home;
};

interface NavSidebarContentProps {
  onNavigate?: () => void;
}

export function NavSidebarContent({ onNavigate }: NavSidebarContentProps) {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();
  const { unreadCount } = useNotifications();

  let menuItems = [...SHARED_MENU_ITEMS];

  if (hasRole(RoleName.ORG_ADMIN)) {
    menuItems = [...ADMIN_MENU_ITEMS, ...menuItems];
  } else if (hasRole(RoleName.INSTRUCTOR)) {
    menuItems = [...INSTRUCTOR_MENU_ITEMS, ...menuItems];
  } else if (hasRole(RoleName.LEARNER)) {
    menuItems = [...LEARNER_MENU_ITEMS, ...menuItems];
  }

  return (
    <>
      <div className="p-5 border-b border-sidebar-border shrink-0">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <img
            src="/logo.png"
            alt="TrailForge Logo"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold text-sidebar-foreground">
            TrailForge
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = getIconForLabel(item.label);
          const isMessages = item.label.toLowerCase().includes("message");
          const badgeCount = isMessages ? unreadCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </div>
              {badgeCount > 0 && (
                <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border shrink-0">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-medium text-sm shrink-0">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function NavSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar flex-col hidden md:flex">
      <NavSidebarContent />
    </aside>
  );
}