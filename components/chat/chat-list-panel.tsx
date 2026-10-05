"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { MessageSquare, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat, getConversationTitle } from "@/lib/context/chat-context";
import { useAuth } from "@/lib/context/auth-context";
import { ConversationResponse } from "@/lib/types/chat";

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d");
}

interface ChatListPanelProps {
  onCreateChat: () => void;
}

export function ChatListPanel({ onCreateChat }: ChatListPanelProps) {
  const { user } = useAuth();
  const { state, fetchConversations, setCurrentConversation } = useChat();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations(0);
  }, [fetchConversations]);

  useEffect(() => {
    if (state.currentConversation) {
      setSelectedId(state.currentConversation.id);
    } else if (!state.conversations.find(c => c.id === selectedId)) {
      setSelectedId(null);
    }
  }, [state.currentConversation, state.conversations]);

  const handleSelectChat = (conversation: ConversationResponse) => {
    setSelectedId(conversation.id);
    setCurrentConversation(conversation);
  };

  if (state.isLoadingConversations && state.conversations.length === 0) {
    return (
      <div className="flex flex-col h-full border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.conversations.length === 0) {
    return (
      <div className="flex flex-col h-full border-r">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button size="sm" onClick={onCreateChat}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No conversations yet</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={onCreateChat}
            >
              Start a chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Button size="sm" onClick={onCreateChat}>
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {state.conversations.map((conversation) => {
            const title = getConversationTitle(conversation, user?.id);
            const isSelected = selectedId === conversation.id;

            return (
              <div
                key={conversation.id}
                onClick={() => handleSelectChat(conversation)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/10"
                    : "hover:bg-secondary"
                }`}
              >
                <Avatar>
                  <AvatarFallback>
                    {title.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{title}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(conversation.updatedAt)}
                      </span>
</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.type === "DIRECT"
                        ? "Direct message"
                        : `${conversation.participants.length} members`}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {conversation.unreadCount > 99
                          ? "99+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}