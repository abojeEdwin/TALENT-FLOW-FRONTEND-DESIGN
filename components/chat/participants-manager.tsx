"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { X, UserMinus, UserPlus, Shield, ShieldAlert, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/context/chat-context";
import { useAuth } from "@/lib/context/auth-context";
import { ParticipantResponse, ReadReceiptResponse } from "@/lib/types/chat";
import * as chatApi from "@/lib/api/chat";

function getRoleBadge(role: string) {
  switch (role) {
    case "OWNER":
      return (
        <Badge variant="default" className="bg-yellow-500">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Owner
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge variant="secondary">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    default:
      return <Badge variant="outline">Member</Badge>;
  }
}

interface ParticipantsListProps {
  conversationId: string;
  onClose: () => void;
}

export function ParticipantsList({ conversationId, onClose }: ParticipantsListProps) {
  const { user } = useAuth();
  const { state, addParticipants, removeParticipant } = useChat();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { currentConversation } = state;
  const participants = currentConversation?.participants || [];
  const currentUserId = user?.id;

  const currentUserRole = participants.find(p => p.userId === currentUserId)?.role;
  const canAddParticipants = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const isDirect = currentConversation?.type === "DIRECT";

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await chatApi.searchUsers(searchQuery, 0, 20);
      const existingIds = new Set(participants.map(p => p.userId));
      setSearchResults(results.content.filter(u => !existingIds.has(u.id)));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      await addParticipants(selectedUsers);
      setSelectedUsers([]);
      setSearchQuery("");
      setSearchResults([]);
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add participants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (userId === currentUserId) {
      try {
        await removeParticipant(userId);
      } catch (error) {
        console.error("Failed to leave:", error);
      }
      return;
    }

    const confirmed = window.confirm("Are you sure you want to remove this participant?");
    if (!confirmed) return;

    try {
      await removeParticipant(userId);
    } catch (error) {
      console.error("Failed to remove participant:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Participants</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {participant.firstName.charAt(0)}
                    {participant.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {participant.firstName} {participant.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participant.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(participant.joinedAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getRoleBadge(participant.role)}
                {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") &&
                  participant.userId !== currentUserId && !isDirect && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveParticipant(participant.userId)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                {participant.userId === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveParticipant(participant.userId)}
                  >
                    Leave
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {!isDirect && (
        <div className="p-4 border-t">
          {isAdding ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback className="h-6 w-6 text-xs">
                            {result.firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {result.firstName} {result.lastName}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedUsers([...selectedUsers, result.id])
                        }
                        disabled={selectedUsers.includes(result.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddParticipants}
                    disabled={isLoading}
                  >
                    Add {selectedUsers.length} participant
                    {selectedUsers.length > 1 ? "s" : ""}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            canAddParticipants && (
              <Button onClick={() => setIsAdding(true)} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Participants
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

interface ReadReceiptsModalProps {
  conversationId: string;
  messageId: string;
  onClose: () => void;
}

export function ReadReceiptsModal({ conversationId, messageId, onClose }: ReadReceiptsModalProps) {
  const [receipts, setReceipts] = useState<ReadReceiptResponse["receipts"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await chatApi.getReadReceipts(conversationId, messageId);
        setReceipts(response.receipts);
      } catch (error) {
        console.error("Failed to fetch receipts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, [conversationId, messageId]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Read Receipts</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : receipts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No receipts yet
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3 p-1">
              {receipts.map((receipt) => (
                <div key={receipt.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="h-8 w-8 text-xs">
                        {receipt.firstName.charAt(0)}
                        {receipt.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {receipt.firstName} {receipt.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Read {format(new Date(receipt.readAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}