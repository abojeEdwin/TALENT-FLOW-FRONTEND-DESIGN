"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Notification, NotificationType } from "@/lib/types";
import { wsClient } from "@/lib/websocket-client";
import { getAuthToken } from "@/lib/api/auth";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
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
    read: false,
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
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();
  const userIdRef = useRef<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (user?.id) {
      userIdRef.current = user.id;
    }
  }, [user]);

  const handleNotificationMessage = useCallback((message: any) => {
    console.log('[Notification] Received:', message);
    const payload = message?.payload || message;

    if (payload && (payload.type || payload.title)) {
      const uid = payload.userId || userIdRef.current || "current-user";
      const notification = createNotificationFromPayload(payload, uid);

      setNotifications((prev) => [notification, ...prev].slice(0, 50));

      const icon = NOTIFICATION_ICONS[notification.type] || "🔔";
      toast.success(`${icon} ${notification.title}`, {
        description: notification.message,
        duration: 5000,
      });
    }
  }, []);

  const connect = useCallback(async () => {
    const token = getAuthToken();
    if (!token || isConnecting) {
      console.log('[Notification] No token or already connecting, skipping connect');
      return;
    }

    setIsConnecting(true);
    const currentUserId = userIdRef.current || user?.id || 'current';

    try {
      console.log('[Notification] Connecting to WebSocket...');
      await wsClient.connect(token);
      console.log('[Notification] Connected, setting state...');
      setIsConnected(true);

      const topic = `/topic/notifications/${currentUserId}`;
      console.log('[Notification] Subscribing to:', topic);
      
      wsClient.subscribeToTopic(topic, handleNotificationMessage);
    } catch (error) {
      console.error("[Notification] WebSocket connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [handleNotificationMessage, user, isConnecting]);

  const disconnect = useCallback(() => {
    wsClient.disconnect();
    setIsConnected(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        connect,
        disconnect,
        markAsRead,
        markAllAsRead,
        clearAll,
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