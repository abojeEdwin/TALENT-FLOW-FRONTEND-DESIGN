// The backend has no delete-conversation or delete-message endpoint.

import { fetchAPI } from "./client";
import {
  SearchUserResponse,
  ConversationResponse,
  MessageResponse,
  ReadReceiptResponse,
  CreateConversationRequest,
  SendMessageRequest,
  AddParticipantRequest,
  PageResponse,
} from "@/lib/types/chat";

export async function searchUsers(
  query: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<SearchUserResponse>> {
  return fetchAPI<PageResponse<SearchUserResponse>>(
    `/chat/users/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
  );
}

export async function createDirectConversation(
  otherUserId: string
): Promise<ConversationResponse> {
  return fetchAPI<ConversationResponse>(`/chat/conversations/direct/${otherUserId}`, {
    method: "POST",
  });
}

export async function createGroupConversation(
  request: CreateConversationRequest
): Promise<ConversationResponse> {
  return fetchAPI<ConversationResponse>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getConversations(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ConversationResponse>> {
  return fetchAPI<PageResponse<ConversationResponse>>(
    `/chat/conversations?page=${page}&size=${size}`
  );
}

export async function getConversation(
  conversationId: string
): Promise<ConversationResponse> {
  return fetchAPI<ConversationResponse>(`/chat/conversations/${conversationId}`);
}

export async function getMessages(
  conversationId: string,
  page: number = 0,
  size: number = 50
): Promise<PageResponse<MessageResponse>> {
  return fetchAPI<PageResponse<MessageResponse>>(
    `/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`
  );
}

export async function sendMessage(
  conversationId: string,
  request: SendMessageRequest
): Promise<MessageResponse> {
  return fetchAPI<MessageResponse>(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function markAsRead(conversationId: string): Promise<void> {
  return fetchAPI<void>(`/chat/conversations/${conversationId}/read`, {
    method: "POST",
  });
}

export async function getReadReceipts(
  conversationId: string,
  messageId: string
): Promise<ReadReceiptResponse> {
  return fetchAPI<ReadReceiptResponse>(
    `/chat/conversations/${conversationId}/read?messageId=${messageId}`
  );
}

export async function addParticipants(
  conversationId: string,
  request: AddParticipantRequest
): Promise<void> {
  return fetchAPI<void>(`/chat/conversations/${conversationId}/participants`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function removeParticipant(
  conversationId: string,
  userId: string
): Promise<void> {
  return fetchAPI<void>(`/chat/conversations/${conversationId}/participants/${userId}`, {
    method: "DELETE",
  });
}
