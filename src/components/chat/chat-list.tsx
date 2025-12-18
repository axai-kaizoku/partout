"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getInitials } from "@/lib/utils";
import { api } from "@/trpc/react";

interface ChatListProps {
  onSelectConversation: (
    conversationId: string,
    otherUserName: string,
    otherUserImage: string | null,
    partTitle: string,
  ) => void;
  selectedConversationId?: string;
}

export function ChatList({
  onSelectConversation,
  selectedConversationId,
}: ChatListProps) {
  const { data: conversations, isLoading } =
    api.chat.getConversations.useQuery();

  const formatLastMessageTime = (date: Date | null) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    }
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No conversations yet. Start chatting with sellers about parts
            you&apos;re interested in!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-0">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() =>
              onSelectConversation(
                conversation.id,
                conversation.otherUser.name || "Unknown User",
                conversation.otherUser.imageUrl,
                conversation.part.title,
              )
            }
            className={cn(
              "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted",
              selectedConversationId === conversation.id && "bg-muted",
            )}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.otherUser.imageUrl || undefined} />
              <AvatarFallback>
                {getInitials(conversation.otherUser.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-semibold">
                  {conversation.otherUser.name || "Unknown User"}
                </p>
                {conversation.lastMessageAt && (
                  <span className="shrink-0 text-muted-foreground text-xs">
                    {formatLastMessageTime(conversation.lastMessageAt)}
                  </span>
                )}
              </div>
              <p className="truncate text-muted-foreground text-sm">
                {conversation.part.title}
              </p>
              {conversation.lastMessage && (
                <p className="truncate text-muted-foreground text-sm">
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
