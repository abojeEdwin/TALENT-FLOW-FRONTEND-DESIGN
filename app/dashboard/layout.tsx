"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { NotificationProvider } from "@/lib/context/notification-context";
import { useRouter } from "next/navigation";
import { NavSidebar, NavSidebarContent } from "@/components/shared/nav-sidebar";
import { UserProfileMenu } from "@/components/shared/user-profile-menu";
import { NotificationBell } from "@/components/shared/notification-bell";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-background">
        <NavSidebar />

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="w-72 bg-sidebar p-0 flex flex-col border-sidebar-border"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation menu
            </SheetDescription>
            <NavSidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 min-w-0 md:ml-64">
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-background">
            <div className="flex items-center gap-3 h-full px-4 md:px-6">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <NotificationBell />
                <UserProfileMenu />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  );
}