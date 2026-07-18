"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  ConversationResponse,
  MessageResponse,
  ParticipantResponse,
  TypingEvent,
  CreateConversationRequest,
  ChatType,
  SearchUserResponse,
  PageResponse,
} from "@/lib/types/chat";
import * as chatApi from "@/lib/api/chat";
import { useAuth } from "@/lib/context/auth-context";
import { useChatWebSocket } from "@/lib/hooks/use-chat-websocket";
import { Client, IMessage } from "@stomp/stompjs";
import { getAuthToken } from "@/lib/api/auth";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

interface ChatState {
  conversations: ConversationResponse[];
  currentConversation: ConversationResponse | null;
  messages: MessageResponse[];
  activeTypers: TypingEvent[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  totalConversations: number;
  totalMessages: number;
  conversationsPage: number;
  messagesPage: number;
  hasMoreMessages: boolean;
  unreadCounts: Record<string, number>;
}

type ChatAction =
  | { type: "SET_CONVERSATIONS"; payload: { conversations: ConversationResponse[]; total: number } }
  | { type: "ADD_CONVERSATION"; payload: ConversationResponse }
  | { type: "SET_CURRENT_CONVERSATION"; payload: ConversationResponse | null }
  | { type: "UPDATE_CONVERSATION"; payload: ConversationResponse }
  | { type: "DELETE_CONVERSATION"; payload: string }
  | { type: "SET_MESSAGES"; payload: { messages: MessageResponse[]; total: number; hasMore: boolean } }
  | { type: "ADD_MESSAGE"; payload: MessageResponse }
  | { type: "DELETE_MESSAGE"; payload: string }
  | { type: "MARK_MESSAGES_READ"; payload: { messageIds: string[] } }
  | { type: "SET_TYPING"; payload: TypingEvent }
  | { type: "REMOVE_TYPING"; payload: string }
  | { type: "SET_LOADING_CONVERSATIONS"; payload: boolean }
  | { type: "SET_LOADING_MESSAGES"; payload: boolean }
  | { type: "SET_SENDING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_UNREAD_COUNT"; payload: { conversationId: string; count: number } }
  | { type: "REMOVE_PARTICIPANT"; payload: { conversationId: string; userId: string } }
  | { type: "ADD_PARTICIPANTS"; payload: { conversationId: string; participants: ParticipantResponse[] } };

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  activeTypers: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
  totalConversations: 0,
  totalMessages: 0,
  conversationsPage: 0,
  messagesPage: 0,
  hasMoreMessages: true,
  unreadCounts: {},
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CONVERSATIONS": {
      const uniqueConversations = Array.from(
        new Map(
          [...state.conversations, ...action.payload.conversations].map((c) => [c.id, c])
        ).values()
      );
      return {
        ...state,
        conversations: uniqueConversations,
        totalConversations: action.payload.total,
        isLoadingConversations: false,
      };
    }
    case "ADD_CONVERSATION": {
      const exists = state.conversations.some(
        (c) => c.id === action.payload.id
      );
      if (exists) return state;
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };
    }
    case "SET_CURRENT_CONVERSATION":
      return {
        ...state,
        currentConversation: action.payload,
        messages: [],
        messagesPage: 0,
        hasMoreMessages: true,
      };
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
        currentConversation:
          state.currentConversation?.id === action.payload.id
            ? action.payload
            : state.currentConversation,
      };
    case "DELETE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(
          (c) => c.id !== action.payload
        ),
        currentConversation:
          state.currentConversation?.id === action.payload
            ? null
            : state.currentConversation,
      };
    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload),
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messages:
          action.payload.messages.length > 0
            ? [...action.payload.messages]
            : [],
        totalMessages: action.payload.total,
        hasMoreMessages: action.payload.hasMore,
        isLoadingMessages: false,
      };
    case "ADD_MESSAGE": {
      const exists = state.messages.some((m) => m.id === action.payload.id);
      if (exists) return state;
      const newMessages = [...state.messages, action.payload];
      const uniqueMessages = Array.from(
        new Map(newMessages.map((m) => [m.id, m])).values()
      );
      return {
        ...state,
        messages: uniqueMessages,
      };
    }
    case "MARK_MESSAGES_READ":
      return {
        ...state,
        messages: state.messages.map((m) =>
          action.payload.messageIds.includes(m.id) ? { ...m, isRead: true } : m
        ),
      };
    case "SET_TYPING": {
      const exists = state.activeTypers.some(
        (t) => t.userId === action.payload.userId
      );
      if (exists) return state;
      return {
        ...state,
        activeTypers: [...state.activeTypers, action.payload],
      };
    }
    case "REMOVE_TYPING":
      return {
        ...state,
        activeTypers: state.activeTypers.filter(
          (t) => t.userId !== action.payload
        ),
      };
    case "SET_LOADING_CONVERSATIONS":
      return { ...state, isLoadingConversations: action.payload };
    case "SET_LOADING_MESSAGES":
      return { ...state, isLoadingMessages: action.payload };
    case "SET_SENDING":
      return { ...state, isSending: action.payload };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoadingConversations: false,
        isLoadingMessages: false,
        isSending: false,
      };
    case "UPDATE_UNREAD_COUNT":
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: action.payload.count,
        },
        conversations: state.conversations.map((c) =>
          c.id === action.payload.conversationId
            ? { ...c, unreadCount: action.payload.count }
            : c
        ),
      };
    case "REMOVE_PARTICIPANT":
      return {
        ...state,
        currentConversation:
          state.currentConversation?.id === action.payload.conversationId
            ? {
                ...state.currentConversation,
                participants: state.currentConversation.participants.filter(
                  (p) => p.userId !== action.payload.userId
                ),
              }
            : state.currentConversation,
      };
    case "ADD_PARTICIPANTS": {
      const existingIds = new Set(
        state.currentConversation?.participants.map((p) => p.userId) || []
      );
      const newParticipants = action.payload.participants.filter(
        (p) => !existingIds.has(p.userId)
      );
      return {
        ...state,
        currentConversation:
          state.currentConversation?.id === action.payload.conversationId
            ? {
                ...state.currentConversation,
                participants: [
                  ...state.currentConversation.participants,
                  ...newParticipants,
                ],
              }
            : state.currentConversation,
      };
    }
    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  fetchConversations: (page?: number) => Promise<void>;
  fetchMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (content: string, replyToMessageId?: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  setCurrentConversation: (conversation: ConversationResponse | null) => void;
  createDirectChat: (userId: string) => Promise<ConversationResponse>;
  createGroupChat: (data: CreateConversationRequest) => Promise<ConversationResponse>;
  addParticipants: (userIds: string[]) => Promise<void>;
  removeParticipant: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<SearchUserResponse[]>;
  deleteConversation: (conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();
  const stompClientRef = useRef<Client | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  const stompConnect = useCallback(() => {
    if (!user || stompClientRef.current?.connected) return;

    const token = getAuthToken();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = new URL(WS_URL);
        wsUrl.searchParams.append("token", token);
        return new WebSocket(wsUrl.toString());
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
      onConnect: () => {
        stompClientRef.current = client;
        subscribeToStompTopics(client);
      },
      onDisconnect: () => {
        stompClientRef.current = null;
      },
    });

    client.activate();
  }, [user]);

  const subscribeToStompTopics = useCallback(
    (client: Client) => {
      if (!state.currentConversation) return;

      const convId = state.currentConversation.id;

      client.subscribe(`/topic/chat/${convId}`, (msg: IMessage) => {
        try {
          const message = JSON.parse(msg.body) as MessageResponse;
          if (message.id) {
            dispatch({ type: "ADD_MESSAGE", payload: message });
          }
        } catch {}
      });

      client.subscribe(`/topic/chat/${convId}/read`, (msg: IMessage) => {
        try {
          const data = JSON.parse(msg.body);
          if (data.messageIds) {
            dispatch({ type: "MARK_MESSAGES_READ", payload: { messageIds: data.messageIds } });
          }
        } catch {}
      });

      client.subscribe(`/topic/chat/${convId}/typing`, (msg: IMessage) => {
        try {
          const data = JSON.parse(msg.body);
          if (data.userId && data.userId !== user?.id) {
            if (data.isTyping) {
              dispatch({ type: "SET_TYPING", payload: data });
            } else {
              dispatch({ type: "REMOVE_TYPING", payload: data.userId });
            }
          }
        } catch {}
      });

      client.subscribe(`/topic/chat/${convId}/participants`, (msg: IMessage) => {
        try {
          const data = JSON.parse(msg.body);
          if (data.userIds) {
            chatApi.getConversation(convId).then((conv) => {
              dispatch({ type: "SET_CURRENT_CONVERSATION", payload: conv });
            });
          } else if (data.userId) {
            dispatch({
              type: "REMOVE_PARTICIPANT",
              payload: { conversationId: convId, userId: data.userId },
            });
          }
        } catch {}
      });
    },
    [state.currentConversation, user?.id]
  );

  useEffect(() => {
    if (user) {
      stompConnect();
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [user, stompConnect]);

  useEffect(() => {
    if (stompClientRef.current?.connected && state.currentConversation) {
      subscribeToStompTopics(stompClientRef.current);
    }
  }, [state.currentConversation, stompConnect, subscribeToStompTopics]);

  const fetchConversations = useCallback(async (page = 0) => {
    dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
    try {
      const response = await chatApi.getConversations(page, 20);
      dispatch({
        type: "SET_CONVERSATIONS",
        payload: {
          conversations: response.content,
          total: response.totalElements,
        },
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to fetch conversations",
      });
    }
  }, []);

  const fetchMessages = useCallback(
    async (conversationId: string, page = 0) => {
      dispatch({ type: "SET_LOADING_MESSAGES", payload: true });
      try {
        const response = await chatApi.getMessages(conversationId, page, 50);
        dispatch({
          type: "SET_MESSAGES",
          payload: {
            messages: response.content,
            total: response.totalElements,
            hasMore: page < response.totalPages - 1,
          },
        });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to fetch messages",
        });
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string, replyToMessageId?: string) => {
      if (!state.currentConversation) return;

      dispatch({ type: "SET_SENDING", payload: true });
      try {
        const message = await chatApi.sendMessage(state.currentConversation.id, {
          content,
          replyToMessageId,
        });
        dispatch({ type: "ADD_MESSAGE", payload: message });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to send message",
        });
      }
    },
    [state.currentConversation]
  );

  const markAsRead = useCallback(async () => {
    if (!state.currentConversation) return;

    try {
      await chatApi.markAsRead(state.currentConversation.id);
      dispatch({
        type: "UPDATE_UNREAD_COUNT",
        payload: { conversationId: state.currentConversation.id, count: 0 },
      });
    } catch {}
  }, [state.currentConversation]);

  const setCurrentConversation = useCallback(
    (conversation: ConversationResponse | null) => {
      dispatch({ type: "SET_CURRENT_CONVERSATION", payload: conversation });
      if (conversation) {
        fetchMessages(conversation.id);
        markAsRead();
        
        // Mark chat notifications for this conversation as read
        // This will be handled by the notification context
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('markChatNotificationsRead', {
            detail: { conversationId: conversation.id }
          }));
        }
      }
    },
    [fetchMessages, markAsRead]
  );

  const createDirectChat = useCallback(async (otherUserId: string) => {
    dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
    try {
      const conversation = await chatApi.createDirectConversation(otherUserId);
      dispatch({ type: "ADD_CONVERSATION", payload: conversation });
      return conversation;
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to create direct chat",
      });
      throw err;
    }
  }, []);

  const createGroupChat = useCallback(async (data: CreateConversationRequest) => {
    dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
    try {
      const conversation = await chatApi.createGroupConversation(data);
      dispatch({ type: "ADD_CONVERSATION", payload: conversation });
      return conversation;
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to create group chat",
      });
      throw err;
    }
  }, []);

  const addParticipants = useCallback(
    async (userIds: string[]) => {
      if (!state.currentConversation) return;

      try {
        await chatApi.addParticipants(state.currentConversation.id, { userIds });
        const updated = await chatApi.getConversation(state.currentConversation.id);
        dispatch({
          type: "ADD_PARTICIPANTS",
          payload: {
            conversationId: state.currentConversation.id,
            participants: updated.participants,
          },
        });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to add participants",
        });
      }
    },
    [state.currentConversation]
  );

  const removeParticipant = useCallback(
    async (userId: string) => {
      if (!state.currentConversation) return;

      try {
        await chatApi.removeParticipant(state.currentConversation.id, userId);
        dispatch({
          type: "REMOVE_PARTICIPANT",
          payload: { conversationId: state.currentConversation.id, userId },
        });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload:
            err instanceof Error ? err.message : "Failed to remove participant",
        });
      }
    },
    [state.currentConversation]
  );

  const searchUsers = useCallback(async (query: string) => {
    try {
      const response = await chatApi.searchUsers(query, 0, 20);
      return response.content;
    } catch {
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      dispatch({ type: "DELETE_CONVERSATION", payload: conversationId });

      try {
        await chatApi.deleteConversation(conversationId);
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : "Failed to delete conversation" });
      }
    },
    []
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!state.currentConversation) return;

      dispatch({ type: "DELETE_MESSAGE", payload: messageId });

      try {
        await chatApi.deleteMessage(state.currentConversation.id, messageId);
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : "Failed to delete message" });
      }
    },
    [state.currentConversation]
  );

  const value = useMemo(
    () => ({
      state,
      fetchConversations,
      fetchMessages,
      sendMessage,
      markAsRead,
      setCurrentConversation,
      createDirectChat,
      createGroupChat,
      addParticipants,
      removeParticipant,
      searchUsers,
      deleteConversation,
      deleteMessage,
      clearError,
    }),
    [
      state,
      fetchConversations,
      fetchMessages,
      sendMessage,
      markAsRead,
      setCurrentConversation,
      createDirectChat,
      createGroupChat,
      addParticipants,
      removeParticipant,
      searchUsers,
      deleteConversation,
      deleteMessage,
      clearError,
    ]
  );

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}

export function getConversationTitle(
  conversation: ConversationResponse | null,
  currentUserId?: string
): string {
  if (!conversation) return "";

  switch (conversation.type) {
    case "DIRECT": {
      const other = conversation.participants.find(
        (p) => p.userId !== currentUserId
      );
      return other ? `${other.firstName} ${other.lastName}` : "Unknown";
    }
    case "FREE_GROUP":
      return conversation.name || "Group chat";
    case "COHORT_CHAT":
      return conversation.cohortName || "Cohort chat";
    case "TEAM_CHAT":
      return conversation.teamName || "Team chat";
    default:
      return "Chat";
  }
}

export function getOtherParticipant(
  conversation: ConversationResponse,
  currentUserId?: string
): ParticipantResponse | undefined {
  if (conversation.type !== "DIRECT") return undefined;
  return conversation.participants.find((p) => p.userId !== currentUserId);
}