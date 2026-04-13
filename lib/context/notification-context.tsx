"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Notification, NotificationType } from "@/lib/types";
import { wsClient } from "@/lib/websocket-client";
import { getAuthToken } from "@/lib/api/auth";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "@/lib/api/notifications";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function createNotificationFromPayload(
  payload: Record<string, unknown>,
  userId: string
): Notification {
  return {
    id: (payload.id as string) || crypto.randomUUID(),
    userId,
    type: (payload.type as NotificationType) || "ASSIGNMENT_CREATED",
    title: (payload.title as string) || "New Notification",
    message: (payload.message as string) || "You have a new notification",
    payload: payload as Notification["payload"],
    createdAt: (payload.createdAt as string) || new Date().toISOString(),
    read: (payload.read as boolean) ?? false,
  };
}

function transformNotification(apiNotification: any): Notification {
  let createdAtStr = apiNotification.createdAt;
  if (createdAtStr && typeof createdAtStr === "string") {
    createdAtStr = createdAtStr.replace("T", " ").substring(0, 19);
  }
  return {
    id: apiNotification.id || "",
    userId: "",
    type: apiNotification.type || "ASSIGNMENT_CREATED",
    title: apiNotification.title || "",
    message: apiNotification.message || "",
    payload: apiNotification.payload,
    createdAt: createdAtStr || new Date().toISOString(),
    read: apiNotification.read || false,
  };
}

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  COURSE_COMPLETED: "🎉",
  ASSIGNMENT_CREATED: "📝",
  ASSIGNMENT_GRADED: "✅",
  FEEDBACK_ADDED: "💬",
  ENROLLMENT_GRANTED: "📚",
  ENROLLMENT_REVOKED: "❌",
  ACCOUNT_STATUS_CHANGED: "🔒",
  ROLE_CHANGED: "👤",
  ACCOUNT_DEACTIVATED: "🚫",
  PASSWORD_RESET_TRIGGERED: "🔑",
  TEAM_ALLOCATED: "👥",
  COURSE_PUBLISHED: "📖",
  COURSE_INSTRUCTORS_ASSIGNED: "👨‍🏫",
  COURSE_INSTRUCTORS_UNASSIGNED: "👨‍🏫",
  UPLOAD_STATUS: "📤",
  UPLOAD_FAILED_ESCALATION: "⚠️",
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      userIdRef.current = user.id;
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getNotifications(0, 50);
      const transformed = response.data.map(transformNotification);
      setNotifications(transformed);
      setUnreadCount(response.unreadCount);
    } catch {
      console.log("[Notification] REST API unavailable");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNotificationMessage = useCallback((message: any) => {
    const payload = message?.payload || message;

    if (payload && (payload.type || payload.title)) {
      const uid = payload.userId || userIdRef.current || "current-user";
      const notification = createNotificationFromPayload(payload, uid);

      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);

      const icon = NOTIFICATION_ICONS[notification.type] || "🔔";
      toast.success(`${icon} ${notification.title}`, {
        description: notification.message,
        duration: 5000,
      });
    }
  }, [unreadCount]);

  const connect = useCallback(async () => {
    const token = getAuthToken();
    if (!token || isConnecting || isConnected) {
      console.log("[Notification] Already connected or connecting, skipping");
      return;
    }

    console.log("[Notification] Attempting to connect...");
    setIsConnecting(true);
    const currentUserId = user?.id || userIdRef.current || 'current';

    try {
      await fetchNotifications();
      console.log("[Notification] Fetched historical notifications");
    } catch (err) {
      console.log("[Notification] REST failed:", err);
    }

    try {
      await wsClient.connect(token);
      console.log("[Notification] WebSocket connected");
      setIsConnected(true);
      const topic = `/topic/notifications/${currentUserId}`;
      wsClient.subscribeToTopic(topic, handleNotificationMessage);
      console.log("[Notification] Subscribed to", topic);
    } catch (err) {
      console.log("[Notification] WebSocket failed:", err);
      setIsConnected(false);
    }

    setIsConnecting(false);
  }, [handleNotificationMessage, user, isConnecting, isConnected, fetchNotifications]);

  const disconnect = useCallback(() => {
    wsClient.disconnect();
    setIsConnected(false);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("[Notification] Failed to mark as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("[Notification] Failed to mark all as read:", error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);

    try {
      await clearAllNotifications();
    } catch (error) {
      console.error("[Notification] Failed to clear notifications:", error);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        connect,
        disconnect,
        markAsRead,
        markAllAsRead,
        clearAll,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}