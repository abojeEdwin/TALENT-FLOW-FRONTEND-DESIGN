"use client";

import { useState } from "react";
import { Search, X, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChat } from "@/lib/context/chat-context";
import { useAuth } from "@/lib/context/auth-context";
import { SearchUserResponse } from "@/lib/types/chat";
import * as chatApi from "@/lib/api/chat";

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (conversationId: string) => void;
}

type ChatTypeOption = "DIRECT" | "FREE_GROUP";

export function CreateChatDialog({ open, onOpenChange, onChatCreated }: CreateChatDialogProps) {
  const { user } = useAuth();
  const { createDirectChat, createGroupChat, searchUsers } = useChat();
  const [chatType, setChatType] = useState<ChatTypeOption>("DIRECT");
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUserResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);

    try {
      const results = await chatApi.searchUsers(searchQuery, 0, 20);
      setSearchResults(results.content.filter(u => u.id !== user?.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateDirectChat = async () => {
    if (!selectedUser) return;

    setIsCreating(true);
    setError(null);

    try {
      const conversation = await createDirectChat(selectedUser.id);
      onChatCreated(conversation.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const conversation = await createGroupChat({
        type: "FREE_GROUP",
        name: groupName.trim(),
      });
      onChatCreated(conversation.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setChatType("DIRECT");
    setGroupName("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new direct message or create a group chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={chatType === "DIRECT" ? "default" : "outline"}
              onClick={() => setChatType("DIRECT")}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Direct Message
            </Button>
            <Button
              variant={chatType === "FREE_GROUP" ? "default" : "outline"}
              onClick={() => setChatType("FREE_GROUP")}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Group Chat
            </Button>
          </div>

          {chatType === "DIRECT" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => setSelectedUser(result)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedUser?.id === result.id
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {result.firstName.charAt(0)}
                          {result.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">
                          {result.firstName} {result.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>Send message to</span>
                    <Badge variant="secondary">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleCreateDirectChat}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Start Chat"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {groupName.length}/120 characters
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                onClick={handleCreateGroupChat}
                disabled={!groupName.trim() || isCreating}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Group"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserSelected: (userId: string) => void;
}

export function UserSearchDialog({ open, onOpenChange, onUserSelected }: UserSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await chatApi.searchUsers(searchQuery, 0, 20);
      setSearchResults(results.content.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
          <DialogDescription>
            Find users to start a conversation with
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isSearching ? (
            <div className="py-8 text-center text-muted-foreground">
              Searching...
            </div>
          ) : hasSearched && searchResults.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onUserSelected(result.id);
                    handleClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Avatar>
                    <AvatarFallback>
                      {result.firstName.charAt(0)}
                      {result.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">
                      {result.firstName} {result.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {result.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}