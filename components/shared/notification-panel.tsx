"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Notification, NotificationType } from "@/lib/types";
import { useNotifications } from "@/lib/context/notification-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  Check,
  Trash2,
  GraduationCap,
  FileText,
  CheckCircle,
  MessageSquare,
  BookOpen,
  XCircle,
  Lock,
  UserCog,
  UserX,
  Key,
  Users,
  BookCheck,
  Upload,
  AlertTriangle,
  Circle,
} from "lucide-react";

const NOTIFICATION_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  COURSE_COMPLETED: { icon: <GraduationCap className="w-4 h-4" />, color: "text-green-500" },
  ASSIGNMENT_CREATED: { icon: <FileText className="w-4 h-4" />, color: "text-blue-500" },
  ASSIGNMENT_GRADED: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500" },
  FEEDBACK_ADDED: { icon: <MessageSquare className="w-4 h-4" />, color: "text-purple-500" },
  ENROLLMENT_GRANTED: { icon: <BookOpen className="w-4 h-4" />, color: "text-green-500" },
  ENROLLMENT_REVOKED: { icon: <XCircle className="w-4 h-4" />, color: "text-red-500" },
  ACCOUNT_STATUS_CHANGED: { icon: <Lock className="w-4 h-4" />, color: "text-orange-500" },
  ROLE_CHANGED: { icon: <UserCog className="w-4 h-4" />, color: "text-blue-500" },
  ACCOUNT_DEACTIVATED: { icon: <UserX className="w-4 h-4" />, color: "text-red-500" },
  PASSWORD_RESET_TRIGGERED: { icon: <Key className="w-4 h-4" />, color: "text-orange-500" },
  TEAM_ALLOCATED: { icon: <Users className="w-4 h-4" />, color: "text-blue-500" },
  COURSE_PUBLISHED: { icon: <BookCheck className="w-4 h-4" />, color: "text-green-500" },
  COURSE_INSTRUCTORS_ASSIGNED: { icon: <Users className="w-4 h-4" />, color: "text-blue-500" },
  COURSE_INSTRUCTORS_UNASSIGNED: { icon: <Users className="w-4 h-4" />, color: "text-orange-500" },
  UPLOAD_STATUS: { icon: <Upload className="w-4 h-4" />, color: "text-blue-500" },
  UPLOAD_FAILED_ESCALATION: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-red-500" },
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type] || {
    icon: <Circle className="w-4 h-4" />,
    color: "text-muted-foreground",
  };

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    } catch {
      return "recently";
    }
  })();

  return (
    <div
      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-secondary/50 ${
        !notification.read ? "bg-secondary/30" : ""
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className={`flex-shrink-0 mt-1 ${config.color}`}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${!notification.read ? "font-semibold" : ""}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    isConnected,
  } = useNotifications();

  return (
    <div className="w-80 md:w-96">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isConnected && (
            <span className="w-2 h-2 rounded-full bg-yellow-500" title="Disconnected" />
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <BellOff className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            You&apos;ll see updates here when they arrive
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={markAllAsRead}
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={clearAll}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}