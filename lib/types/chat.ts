// Chat Types

export type ChatType = 'DIRECT' | 'FREE_GROUP' | 'COHORT_CHAT' | 'TEAM_CHAT';

export type ParticipantRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface SearchUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SenderResponse {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ParticipantResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ParticipantRole;
  joinedAt: string;
}

export interface ConversationResponse {
  id: string;
  type: ChatType;
  name?: string;
  cohortId?: string;
  cohortName?: string;
  teamId?: string;
  teamName?: string;
  participants: ParticipantResponse[];
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

export interface MessageResponse {
  id: string;
  content: string;
  sender: SenderResponse;
  replyToMessageId?: string;
  replyToContent?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReceiptDetail {
  messageId: string;
  userId: string;
  firstName: string;
  lastName: string;
  readAt: string;
}

export interface ReadReceiptResponse {
  receipts: ReceiptDetail[];
}

export interface CreateConversationRequest {
  type: ChatType;
  name?: string;
  cohortId?: string;
  teamId?: string;
}

export interface SendMessageRequest {
  content: string;
  replyToMessageId?: string;
}

export interface AddParticipantRequest {
  userIds: string[];
}

// Spring Page response shape
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// WebSocket event types
export interface ChatMessageEvent {
  conversationId: string;
  message: MessageResponse;
}

export interface ReadEvent {
  conversationId: string;
  userId: string;
  messageIds: string[];
  readAt: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  isTyping: boolean;
}

export interface ParticipantAddEvent {
  conversationId: string;
  userIds: string[];
}

export interface ParticipantRemoveEvent {
  conversationId: string;
  userId: string;
}

// Chat state types
export interface ChatState {
  conversations: ConversationResponse[];
  currentConversation: ConversationResponse | null;
  messages: MessageResponse[];
  participants: ParticipantResponse[];
  activeTypers: TypingEvent[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  unreadCounts: Record<string, number>;
}

export interface ChatActions {
  fetchConversations: (page?: number, size?: number) => Promise<void>;
  fetchMessages: (conversationId: string, page?: number, size?: number) => Promise<void>;
  sendMessage: (conversationId: string, content: string, replyToMessageId?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  createDirectConversation: (otherUserId: string) => Promise<ConversationResponse>;
  createGroupConversation: (request: CreateConversationRequest) => Promise<ConversationResponse>;
  addParticipants: (conversationId: string, userIds: string[]) => Promise<void>;
  removeParticipant: (conversationId: string, userId: string) => Promise<void>;
  searchUsers: (query: string, page?: number, size?: number) => Promise<SearchUserResponse[]>;
}