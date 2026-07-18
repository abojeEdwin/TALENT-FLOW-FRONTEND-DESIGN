"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChatProvider, useChat } from "@/lib/context/chat-context";
import { ChatLayout } from "@/components/chat/chat-layout";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { state, setCurrentConversation } = useChat();
  const conversationId = searchParams.get('conversationId');

  useEffect(() => {
    if (conversationId && state.conversations.length > 0) {
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation && state.currentConversation?.id !== conversationId) {
        setCurrentConversation(conversation);
      }
    }
  }, [conversationId, state.conversations, state.currentConversation, setCurrentConversation]);

  return (
    <div className="h-full">
      <ChatLayout />
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}