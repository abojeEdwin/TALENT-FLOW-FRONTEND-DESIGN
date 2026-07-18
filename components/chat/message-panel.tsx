"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, MoreVertical, Users, CheckCheck, Trash2 } from "lucide-react";
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
import { MessageResponse } from "@/lib/types/chat";

interface MessageBubbleProps {
  message: MessageResponse;
  isOwn: boolean;
  onReply: (message: MessageResponse) => void;
  onShowReceipts: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

function MessageBubble({ message, isOwn, onReply, onShowReceipts, onDelete }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  return (
    <div
      className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className="text-xs">
          {message.sender.firstName.charAt(0)}
          {message.sender.lastName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">
            {message.sender.firstName} {message.sender.lastName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div className="relative">
          <div
            className={`text-sm p-3 rounded-lg ${
              isOwn ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            {message.content}
          </div>
          {isOwn && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-1 -right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(message.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          {message.isRead && isOwn && (
            <CheckCheck className="h-3 w-3 text-muted-foreground" />
          )}
          <button
            onClick={() => onReply(message)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reply
          </button>
          <button
            onClick={() => onShowReceipts(message.id)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Receipts
          </button>
        </div>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  users: { firstName: string; lastName: string }[];
}

function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names =
    users.length === 1
      ? `${users[0].firstName} is`
      : users.length === 2
      ? `${users[0].firstName} and ${users[1].firstName} are`
      : `${users[0].firstName} and ${users.length - 1} others are`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.1s]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
      </div>
      <span>{names} typing...</span>
    </div>
  );
}

interface MessagePanelProps {
  onShowParticipants: () => void;
  onShowReceipts: (messageId: string) => void;
  onBack: () => void;
}

export function MessagePanel({
  onShowParticipants,
  onShowReceipts,
  onBack,
}: MessagePanelProps) {
  const { user } = useAuth();
  const { state, fetchMessages, fetchConversations, deleteMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null);

  const { currentConversation, messages, activeTypers, isLoadingMessages } = state;

  const handleDelete = async (messageId: string) => {
    if (confirm("Delete this message?")) {
      await deleteMessage(messageId);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation, fetchMessages]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const title = getConversationTitle(currentConversation, user?.id);
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const otherTypers = activeTypers.filter((t) => t.userId !== user?.id);

  const handleReply = (message: MessageResponse) => {
    setReplyTo(message);
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarFallback>{title.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {currentConversation.type === "DIRECT"
                ? "Direct message"
                : `${currentConversation.participants.length} members`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onShowParticipants}>
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoadingMessages && messages.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-2 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton
                  className={`h-16 w-48 rounded-lg ${
                    i % 2 === 0 ? "ml-auto" : ""
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender.id === user?.id}
                onReply={handleReply}
                onShowReceipts={onShowReceipts}
                onDelete={handleDelete}
              />
            ))}
            <TypingIndicator users={otherTypers} />
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <MessageComposer replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </div>
  );
}

interface MessageComposerProps {
  replyTo: MessageResponse | null;
  onCancelReply: () => void;
}

function MessageComposer({ replyTo, onCancelReply }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { state, sendMessage, markAsRead } = useChat();
  const { currentConversation } = state;

  const handleSend = async () => {
    if (!content.trim() || !currentConversation) return;

    setIsSending(true);
    try {
      await sendMessage(content.trim(), replyTo?.id);
      setContent("");
      onCancelReply();
      markAsRead();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t">
      {replyTo && (
        <div className="flex items-center justify-between mb-2 p-2 bg-secondary rounded-lg">
          <div className="text-xs">
            <span className="font-medium">Replying to:</span>{" "}
            {replyTo.content.substring(0, 30)}
            {replyTo.content.length > 30 ? "..." : ""}
          </div>
          <Button variant="ghost" size="sm" onClick={onCancelReply}>
            ×
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 min-h-[44px] max-h-32 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isSending}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}