"use client";

import { useCallback, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { cn, getInitials } from "@/lib/utils";
import type { Message } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { MessageInput } from "./message-input";

interface ChatWindowProps {
  conversationId: string;
  otherUserName: string;
  otherUserImage?: string | null;
  partTitle: string;
  currentUserId: string;
}

export function ChatWindow({
  conversationId,
  otherUserName,
  otherUserImage,
  partTitle,
  currentUserId,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();
  const { showNotification, requestPermission, permission } =
    useNotifications();

  const { data: messages, isLoading } = api.chat.getMessages.useQuery(
    conversationId,
    {
      refetchOnWindowFocus: false,
    },
  );

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    // Optimistic update using React Query cache
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await utils.chat.getMessages.cancel(conversationId);

      // Snapshot the previous value
      const previousMessages = utils.chat.getMessages.getData(conversationId);

      // Optimistically update to the new value
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId: newMessage.conversationId,
        senderId: currentUserId,
        content: newMessage.content,
        isRead: false,
        createdAt: new Date(),
        sender: {
          id: currentUserId,
          name: "You",
          imageUrl: null,
        },
      };

      utils.chat.getMessages.setData(conversationId, (old) => [
        ...(old || []),
        optimisticMessage as any,
      ]);

      // Return context with snapshot
      return { previousMessages };
    },
    // If mutation fails, roll back to the previous value
    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        utils.chat.getMessages.setData(
          conversationId,
          context.previousMessages,
        );
      }
    },
    // Always refetch after error or success to ensure consistency
    onSettled: () => {
      utils.chat.getMessages.invalidate(conversationId);
      utils.chat.getConversations.invalidate();
    },
  });

  const markAsReadMutation = api.chat.markAsRead.useMutation();

  const handleSendMessage = useCallback(
    (content: string) => {
      sendMessageMutation.mutate({
        conversationId,
        content,
      });
    },
    [conversationId, sendMessageMutation],
  );

  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      // When a new message comes from realtime, invalidate to refetch with full data
      // This ensures we get the complete message with sender info
      utils.chat.getMessages.invalidate(conversationId);
      utils.chat.getConversations.invalidate();

      // Show browser notification if message is from other user
      if (newMessage.senderId !== currentUserId) {
        showNotification({
          senderName: otherUserName,
          message: newMessage.content,
          partTitle: partTitle,
          senderImage: otherUserImage,
          conversationId: conversationId,
        });
      }
    },
    [
      conversationId,
      utils,
      currentUserId,
      otherUserName,
      partTitle,
      otherUserImage,
      showNotification,
    ],
  );

  // Setup realtime subscription
  useRealtimeMessages({
    conversationId,
    onNewMessage: handleNewMessage,
    enabled: true,
  });

  // Request notification permission on mount if needed
  useEffect(() => {
    if (permission.default) {
      requestPermission();
    }
  }, [permission.default, requestPermission]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    markAsReadMutation.mutate({ conversationId });
  }, [conversationId, markAsReadMutation.mutate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex-1 space-y-4 p-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="ml-auto h-16 w-3/4" />
          <Skeleton className="h-16 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUserImage || undefined} />
            <AvatarFallback>{getInitials(otherUserName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{otherUserName}</CardTitle>
            <p className="text-muted-foreground text-sm">Re: {partTitle}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2",
                    isCurrentUser && "flex-row-reverse",
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        isCurrentUser ? undefined : otherUserImage || undefined
                      }
                    />
                    <AvatarFallback className="text-xs">
                      {isCurrentUser ? "You" : getInitials(otherUserName)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg bg-muted px-4 py-2",
                      isCurrentUser && "bg-primary text-primary-foreground",
                    )}
                  >
                    <p className="wrap-break-word whitespace-pre-wrap text-sm">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-muted-foreground text-xs",
                        isCurrentUser && "text-primary-foreground/70",
                      )}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                No messages yet. Start chatting with {otherUserName}
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <MessageInput
        onSend={handleSendMessage}
        disabled={sendMessageMutation.isPending}
      />
    </Card>
  );
}
