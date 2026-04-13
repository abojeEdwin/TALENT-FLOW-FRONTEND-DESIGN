"use client";

import { useState, useEffect, useRef } from "react";
import { useNotifications } from "@/lib/context/notification-context";
import { NotificationPanel } from "./notification-panel";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, Wifi, WifiOff } from "lucide-react";

export function NotificationBell() {
  const { unreadCount, isConnected, connect, disconnect } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const hasConnected = useRef(false);

  useEffect(() => {
    if (!hasConnected.current) {
      hasConnected.current = true;
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {!isConnected && (
            <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-background bg-yellow-500">
              <WifiOff className="w-1.5 h-1.5 text-white" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="end" sideOffset={8}>
        <NotificationPanel onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}