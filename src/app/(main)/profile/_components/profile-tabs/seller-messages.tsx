"use client";

import { useState } from "react";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";

export function SellerMessages() {
  const user = useUser();
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUserName: string;
    otherUserImage: string | null;
    partTitle: string;
  } | null>(null);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Please sign in to view your messages.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid h-[600px] gap-4 md:grid-cols-[350px_1fr]">
      <div className="h-full overflow-hidden">
        <ChatList
          onSelectConversation={(id, name, image, title) =>
            setSelectedConversation({
              id,
              otherUserName: name,
              otherUserImage: image,
              partTitle: title,
            })
          }
          selectedConversationId={selectedConversation?.id}
        />
      </div>

      <div className="h-full overflow-hidden">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUserName={selectedConversation.otherUserName}
            otherUserImage={selectedConversation.otherUserImage}
            partTitle={selectedConversation.partTitle}
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
  );
}
