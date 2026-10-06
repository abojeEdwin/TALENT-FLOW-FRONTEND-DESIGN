import { fetchAPI } from "./client";
import { Notification } from "@/lib/types";
import { Page } from "./types";

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export type NotificationsPageResponse = Page<NotificationResponse>;

function transformNotification(apiNotification: NotificationResponse): Notification {
  let createdAtStr = apiNotification.createdAt;
  if (createdAtStr && typeof createdAtStr === "string") {
    if (createdAtStr.includes("T")) {
      createdAtStr = createdAtStr.replace("T", " ").substring(0, 19);
    }
  }

  return {
    id: apiNotification.id,
    userId: "",
    type: (apiNotification.type as Notification["type"]) || "ASSIGNMENT_CREATED",
    title: apiNotification.title,
    message: apiNotification.message,
    payload: apiNotification.payload as Notification["payload"],
    createdAt: createdAtStr || new Date().toISOString(),
    read: apiNotification.read,
  };
}

export async function getNotifications(
  page = 0,
  limit = 20
): Promise<{
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}> {
  try {
    const data = await fetchAPI<NotificationsPageResponse>(
      `/notifications/`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      }
    );
    return {
      data: data.content.map(transformNotification),
      total: data.totalElements,
      page: data.number,
      limit: data.size,
      unreadCount: data.content.filter((n) => !n.read).length,
    };
  } catch {
    return {
      data: [],
      total: 0,
      page: 0,
      limit,
      unreadCount: 0,
    };
  }
}

export async function getUnreadNotifications(): Promise<{
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}> {
  const data = await fetchAPI<NotificationsPageResponse>("/notifications/?page=0&size=50");
  const unread = data.content.filter((n) => !n.read);

  return {
    data: unread.map(transformNotification),
    total: unread.length,
    page: data.number,
    limit: data.size,
    unreadCount: unread.length,
  };
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return fetchAPI<void>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  // Backend exposes PATCH and PUT on /notifications/read-all.
  // /notifications/mark-all-read is deprecated and logs a warning server-side.
  await fetchAPI("/notifications/read-all", { method: "PATCH" });
}

export async function clearAllNotifications(): Promise<void> {
  return fetchAPI<void>("/notifications", {
    method: "DELETE",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return fetchAPI<void>(`/notifications/${id}`, {
    method: "DELETE",
  });
}
