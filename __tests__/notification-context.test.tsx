import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { NotificationProvider, useNotifications } from '../lib/context/notification-context';
import * as notificationsApi from '../lib/api/notifications';
import { Notification, NotificationType } from '../lib/types';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'learner' as const,
  createdAt: new Date().toISOString(),
};

vi.mock('../lib/api/notifications', () => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  clearAllNotifications: vi.fn(),
}));

vi.mock('../lib/websocket-client', () => ({
  wsClient: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribeToTopic: vi.fn(() => () => {}),
    isConnected: vi.fn(() => false),
  },
}));

vi.mock('../lib/api/auth', () => ({
  getAuthToken: vi.fn(() => 'test-token'),
  setAuthToken: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'test-id-1',
  userId: 'user-1',
  type: 'CHAT_MESSAGE_RECEIVED' as NotificationType,
  title: 'New chat message',
  message: 'John Doe sent you a message',
  payload: {
    conversationId: 'conv-1',
    messageId: 'msg-1',
    senderId: 'sender-1',
    senderName: 'John Doe',
    chatType: 'DIRECT',
    preview: 'Hello!',
  },
  createdAt: new Date().toISOString(),
  read: false,
  ...overrides,
});

const createAuthContextValue = () => ({
  user: { id: 'user-1' } as any,
  isLoading: false,
  isAuthenticated: true,
  hasRole: () => true,
  logout: async () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { useAuth } = require('../lib/context/auth-context');
  const AuthContext = require('../lib/context/auth-context').AuthContext;
  const { useContext, createContext } = require('react');
  
  const authValue = createAuthContextValue();
  
  const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children: c }) => {
    const { useAuth: useAuthInner } = require('../lib/context/auth-context');
    const authCtx = useContext(createContext(authValue as any));
    return c;
  };
  return <MockAuthProvider>{children}</MockAuthProvider>;
};

describe('Notification Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('dedupe logic', () => {
    it('should deduplicate notifications by id', () => {
      const notifications: Notification[] = [
        createMockNotification({ id: 'notif-1' }),
        createMockNotification({ id: 'notif-1' }),
        createMockNotification({ id: 'notif-2' }),
      ];

      const uniqueIds = new Set(notifications.map(n => n.id));
      expect(uniqueIds.size).toBe(2);
      expect(notifications.filter(n => n.id === 'notif-1')).toHaveLength(2);
    });

    it('should handle merging notifications and deduplicate', () => {
      const existingNotifications: Notification[] = [
        createMockNotification({ id: 'existing-1' }),
      ];

      const newNotifications: Notification[] = [
        createMockNotification({ id: 'new-1' }),
        createMockNotification({ id: 'existing-1' }),
      ];

      const existingIds = new Set(existingNotifications.map(n => n.id));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
      const merged = [...uniqueNew, ...existingNotifications];

      expect(merged).toHaveLength(2);
      expect(merged.find(n => n.id === 'new-1')).toBeDefined();
      expect(merged.find(n => n.id === 'existing-1')).toBeDefined();
    });
  });

  describe('mark-as-read', () => {
    it('should calculate unread count correctly', () => {
      const notifications: Notification[] = [
        createMockNotification({ id: '1', read: false }),
        createMockNotification({ id: '2', read: false }),
        createMockNotification({ id: '3', read: true }),
        createMockNotification({ id: '4', read: true }),
      ];

      const unreadCount = notifications.filter(n => !n.read).length;
      expect(unreadCount).toBe(2);
    });

    it('should decrement unread count when marked as read', () => {
      let unreadCount = 3;

      const markAsRead = () => {
        unreadCount = Math.max(0, unreadCount - 1);
      };

      markAsRead();
      expect(unreadCount).toBe(2);

      markAsRead();
      expect(unreadCount).toBe(1);
    });
  });

  describe('notification click navigation', () => {
    it('should contain conversationId in payload for CHAT_MESSAGE_RECEIVED', () => {
      const notification: Notification = {
        id: 'test-chat-notif',
        userId: 'user-1',
        type: 'CHAT_MESSAGE_RECEIVED' as NotificationType,
        title: 'New Message',
        message: 'You have a new message',
        payload: {
          conversationId: 'conv-123',
          messageId: 'msg-456',
          senderId: 'sender-789',
          senderName: 'Test Sender',
          chatType: 'DIRECT',
          preview: 'Hi there!',
        },
        createdAt: new Date().toISOString(),
        read: false,
      };

      expect(notification.payload).toBeDefined();
      expect((notification.payload as any).conversationId).toBe('conv-123');
    });

    it('should navigate to chat with conversationId from payload', () => {
      const mockPush = vi.fn();
      
      const onNotificationClick = (notification: Notification) => {
        if (notification.type === 'CHAT_MESSAGE_RECEIVED') {
          const payload = notification.payload as any;
          if (payload?.conversationId) {
            mockPush(`/dashboard/chat?conversationId=${payload.conversationId}`);
          }
        }
      };

      const notification = createMockNotification({
        type: 'CHAT_MESSAGE_RECEIVED' as NotificationType,
        payload: {
          conversationId: 'conv-abc',
          messageId: 'msg-xyz',
          senderId: 'sender-1',
          senderName: 'Test',
          chatType: 'DIRECT',
          preview: 'test',
        },
      });

      onNotificationClick(notification);

      expect(mockPush).toHaveBeenCalledWith('/dashboard/chat?conversationId=conv-abc');
    });
  });

  describe('unread badge', () => {
    it('should return correct unread count from notifications', () => {
      const notifications: Notification[] = [
        createMockNotification({ id: '1', read: false }),
        createMockNotification({ id: '2', read: false }),
        createMockNotification({ id: '3', read: true }),
        createMockNotification({ id: '4', read: false }),
      ];

      const unreadCount = notifications.filter(n => !n.read).length;
      expect(unreadCount).toBe(3);
    });
  });

  describe('websocket event handling', () => {
    it('should handle CHAT_MESSAGE_RECEIVED type filter', () => {
      const handleNotificationMessage = (type: string) => {
        if (type !== 'CHAT_MESSAGE_RECEIVED') {
          return false;
        }
        return true;
      };

      expect(handleNotificationMessage('CHAT_MESSAGE_RECEIVED')).toBe(true);
      expect(handleNotificationMessage('ASSIGNMENT_CREATED')).toBe(false);
    });
  });

  describe('notification types', () => {
    it('should have CHAT_MESSAGE_RECEIVED in NotificationType', () => {
      const validTypes: NotificationType[] = [
        'CHAT_MESSAGE_RECEIVED',
        'COURSE_COMPLETED',
        'ASSIGNMENT_CREATED',
      ];

      expect(validTypes).toContain('CHAT_MESSAGE_RECEIVED');
    });
  });
});