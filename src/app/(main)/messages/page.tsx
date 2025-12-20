"use client";

import { unauthorized, useSearchParams } from "next/navigation";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { api } from "@/trpc/react";

export default function MessagesPage() {
  const user = useUser();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  const { data: conversation, isLoading: isLoadingConversation } =
    api.chat.getConversation.useQuery(conversationId ?? "", {
      enabled: !!conversationId && !!user,
    });

  if (!user) {
    return unauthorized();
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="grid h-[calc(100vh-8rem)] gap-4 md:grid-cols-[350px_1fr]">
            <div className="h-full overflow-hidden">
              <ChatList selectedConversationId={conversationId || undefined} />
            </div>

            <div className="h-full overflow-hidden">
              {isLoadingConversation ? (
                <Card className="flex h-full flex-col">
                  <CardContent className="flex-1 space-y-4 p-4">
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="ml-auto h-16 w-3/4" />
                    <Skeleton className="h-16 w-3/4" />
                  </CardContent>
                </Card>
              ) : conversation ? (
                <ChatWindow
                  conversationId={conversation.id}
                  otherUserName={conversation.otherUser.name || "Unknown User"}
                  otherUserImage={conversation.otherUser.imageUrl}
                  partTitle={conversation.part.title}
                  currentUserId={user.id}
                />
              ) : (
                <Card className="flex h-full items-center justify-center">
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      Select a conversation to start chatting
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
