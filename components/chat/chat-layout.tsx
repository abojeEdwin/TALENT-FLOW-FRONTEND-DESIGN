"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/context/chat-context";
import { ChatListPanel } from "./chat-list-panel";
import { MessagePanel } from "./message-panel";
import { ParticipantsList, ReadReceiptsModal } from "./participants-manager";
import { CreateChatDialog } from "./create-chat-dialog";
import { useAuth } from "@/lib/context/auth-context";
import { ConversationResponse } from "@/lib/types/chat";

export function ChatLayout() {
  const { user } = useAuth();
  const { state, setCurrentConversation } = useChat();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReadReceipts, setShowReadReceipts] = useState(false);
  const [selectedReceiptMessage, setSelectedReceiptMessage] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (state.currentConversation && isMobileView) {
      setShowParticipants(false);
    }
  }, [state.currentConversation, isMobileView]);

  const handleBack = () => {
    setCurrentConversation(null);
  };

  const handleShowReceipts = (messageId: string) => {
    setSelectedReceiptMessage(messageId);
    setShowReadReceipts(true);
  };

  const handleChatCreated = (conversationId: string) => {
    setShowCreateDialog(false);
    const conversation = state.conversations.find((c: ConversationResponse) => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const showListPanel = !isMobileView || !state.currentConversation;
  const showMessagePanel = !isMobileView || state.currentConversation;

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {showListPanel && (
        <div className={`${isMobileView ? "w-full" : "w-80"} border-r`}>
          <ChatListPanel onCreateChat={() => setShowCreateDialog(true)} />
        </div>
      )}

      {showMessagePanel && (
        <div className={`${isMobileView ? "w-full" : "flex-1"}`}>
          <MessagePanel
            onShowParticipants={() => setShowParticipants(true)}
            onShowReceipts={handleShowReceipts}
            onBack={handleBack}
          />
        </div>
      )}

      {showParticipants && state.currentConversation && (
        <div className="w-80 border-l fixed right-0 top-0 h-full bg-background z-50">
          <ParticipantsList
            conversationId={state.currentConversation.id}
            onClose={() => setShowParticipants(false)}
          />
        </div>
      )}

      <CreateChatDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onChatCreated={handleChatCreated}
      />

      {showReadReceipts && selectedReceiptMessage && state.currentConversation && (
        <ReadReceiptsModal
          conversationId={state.currentConversation.id}
          messageId={selectedReceiptMessage}
          onClose={() => {
            setShowReadReceipts(false);
            setSelectedReceiptMessage(null);
          }}
        />
      )}
    </div>
  );
}