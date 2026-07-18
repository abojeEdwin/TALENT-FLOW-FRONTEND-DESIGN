"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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

interface ChatMessageNotificationPayload {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  chatType: "DIRECT" | "FREE_GROUP" | "COHORT_CHAT" | "TEAM_CHAT";
  preview: string;
}

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
  onNotificationClick: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface WebSocketMessage {
  payload?: Record<string, unknown>;
}

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
  CHAT_MESSAGE_RECEIVED: "💬",
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const userIdRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (user?.id) {
      userIdRef.current = user.id;
    }
  }, [user]);

  // Refresh notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const mergeNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id));
      const merged = [...uniqueNew, ...prev];
      const limited = merged.slice(0, 50);
      
      // Update unread count based on merged notifications
      const unreadInMerged = limited.filter((n) => !n.read).length;
      setUnreadCount(unreadInMerged);
      
      return limited;
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getNotifications(0, 50);
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showToast = useCallback((notification: Notification) => {
    const icon = NOTIFICATION_ICONS[notification.type] || "🔔";
    toast.success(`${icon} ${notification.title}`, {
      description: notification.message,
      duration: 5000,
      action: notification.type === "CHAT_MESSAGE_RECEIVED" ? {
        label: "View",
        onClick: () => {
          const payload = notification.payload as ChatMessageNotificationPayload | undefined;
          if (payload?.conversationId) {
            router.push(`/dashboard/chat?conversationId=${payload.conversationId}`);
          }
        },
      } : undefined,
    });
  }, [router]);

  const handleNotificationMessage = useCallback((message: WebSocketMessage) => {
    const payload = message?.payload as Record<string, unknown> || message;

    if (payload && (payload.type || payload.title)) {
      const type = payload.type as string;
      
      if (type !== "CHAT_MESSAGE_RECEIVED") {
        return;
      }
      
      const notificationId = payload.id as string;
      
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notificationId);
        if (exists) return prev;
        
        const uid = (payload.userId as string) || userIdRef.current || "current-user";
        const notification = createNotificationFromPayload(payload, uid);
        
        setUnreadCount((count) => count + 1);
        showToast(notification);
        
        const merged = [notification, ...prev];
        const unique = Array.from(
          new Map(merged.map((n) => [n.id, n])).values()
        );
        return unique.slice(0, 50);
      });
    }
  }, [showToast]);

  const connect = useCallback(async () => {
    const token = getAuthToken();
    if (!token || isConnecting || isConnected) {
      return;
    }

    setIsConnecting(true);
    const currentUserId = user?.id || userIdRef.current || 'current';

    try {
      await fetchNotifications();
    } catch {
    }

    try {
      await wsClient.connect(token);
      setIsConnected(true);
      const topic = `/topic/notifications/${currentUserId}`;
      unsubscribeRef.current = wsClient.subscribeToTopic(topic, handleNotificationMessage);
    } catch {
      setIsConnected(false);
    }

    setIsConnecting(false);
  }, [handleNotificationMessage, user, isConnecting, isConnected, fetchNotifications]);

  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    wsClient.disconnect();
    setIsConnected(false);
  }, []);

  const onNotificationClick = useCallback(async (notification: Notification) => {
    if (notification.type === "CHAT_MESSAGE_RECEIVED") {
      const payload = notification.payload as ChatMessageNotificationPayload | undefined;
      if (payload?.conversationId) {
        router.push(`/dashboard/chat?conversationId=${payload.conversationId}`);
      }
    }
    
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  }, [router]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistically update UI
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unreadInUpdated = updated.filter((n) => !n.read).length;
      setUnreadCount(unreadInUpdated);
      return updated;
    });

    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert optimistic update on error
      setNotifications((prev) => {
        const reverted = prev.map((n) => (n.id === id ? { ...n, read: false } : n));
        const unreadInReverted = reverted.filter((n) => !n.read).length;
        setUnreadCount(unreadInReverted);
        return reverted;
      });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Store previous state for rollback
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    
    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (error: any) {
      console.error("Failed to mark all notifications as read:", error);
      
      // Check if it's a backend cache/serialization error
      const errorMessage = error?.message || '';
      const isBackendCacheError = errorMessage.includes('MismatchedInputException') || 
                                   errorMessage.includes('Unexpected token') ||
                                   errorMessage.includes('deserialize');
      
      if (isBackendCacheError) {
        toast.error("Backend cache error detected. Please contact your administrator to clear the Redis cache.");
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        return;
      }
      
      // Try fallback: mark each unread notification individually
      try {
        const unreadNotifications = previousNotifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          console.log(`Attempting fallback: marking ${unreadNotifications.length} notifications individually`);
          await Promise.all(
            unreadNotifications.map(n => markNotificationAsRead(n.id).catch(err => {
              console.error(`Failed to mark notification ${n.id} as read:`, err);
            }))
          );
          // If fallback succeeds, keep the optimistic update
          toast.success("Notifications marked as read");
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
      
      // Revert on error if fallback also failed
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      
      // Show user-friendly error message
      toast.error("Failed to mark all notifications as read. Please try again.");
    }
  }, [notifications, unreadCount]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);

    try {
      await clearAllNotifications();
    } catch {
      // Silently fail
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Listen for chat conversation opened events to mark notifications as read
  useEffect(() => {
    const handleMarkChatNotificationsRead = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { conversationId } = customEvent.detail;
      
      // Find all unread chat notifications for this conversation
      const chatNotifications = notifications.filter(
        n => n.type === 'CHAT_MESSAGE_RECEIVED' && 
             !n.read && 
             (n.payload as any)?.conversationId === conversationId
      );
      
      // Mark each notification as read
      for (const notification of chatNotifications) {
        await markAsRead(notification.id);
      }
    };
    
    window.addEventListener('markChatNotificationsRead', handleMarkChatNotificationsRead);
    
    return () => {
      window.removeEventListener('markChatNotificationsRead', handleMarkChatNotificationsRead);
    };
  }, [notifications, markAsRead]);

  const value = useMemo(() => ({
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
    onNotificationClick,
  }), [
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
    onNotificationClick,
  ]);

  return (
    <NotificationContext.Provider value={value}>
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
